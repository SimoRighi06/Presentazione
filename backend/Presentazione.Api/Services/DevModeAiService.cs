namespace Presentazione.Api.Services;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Presentazione.Api.Dtos;

using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

public class DevModeAiService : IDevModeAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _contextTemplate;
    private readonly IWebHostEnvironment _env;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public DevModeAiService(HttpClient httpClient, IConfiguration config, IWebHostEnvironment env)
    {
        _httpClient = httpClient;
        _env = env;

        _apiKey = config["Gemini:ApiKey"]
            ?? throw new InvalidOperationException("Chiave Gemini mancante in appsettings.json");

        var assetsPath = Path.Combine(env.ContentRootPath, "Assets", "AI");
        Directory.CreateDirectory(assetsPath);

        var contextFile = Path.Combine(assetsPath, "devmode-context.md");
        if (!File.Exists(contextFile))
        {
            File.WriteAllText(contextFile,
                "# TECNOPROGRESS COMPONENT LIBRARY\n# TODO: Inserisci qui la tua libreria componenti");
        }
        _contextTemplate = File.ReadAllText(contextFile);
    }

    private async Task<byte[]> GetDraftImageAsync(string siteParam, string draftId)
    {
        var possibleExtensions = new[] { ".webp", ".jpg", ".jpeg", ".png" };

        foreach (var ext in possibleExtensions)
        {
            var imageUrl = $"http://{siteParam}.bozzasito.com/bozze/images/{draftId}{ext}";
            try
            {
                var imageBytes = await _httpClient.GetByteArrayAsync(imageUrl);
                Console.WriteLine($"✅ IMMAGINE SCARICATA: {imageUrl}");
                return imageBytes;
            }
            catch (HttpRequestException) { continue; }
        }

        throw new FileNotFoundException($"Bozza '{draftId}' non trovata per '{siteParam}' sul server remoto.");
    }

    private static byte[] OptimizeImageForAI(byte[] originalBytes)
    {
        const int maxWidth = 1280;
        const int jpegQuality = 65;

        using var image = Image.Load(originalBytes);
        if (image.Width > maxWidth)
        {
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Max,
                Size = new Size(maxWidth, 0)
            }));
        }

        using var ms = new MemoryStream();
        image.Save(ms, new JpegEncoder { Quality = jpegQuality });
        var optimized = ms.ToArray();
        Console.WriteLine($"📦 [Optimize] {originalBytes.Length / 1024}KB -> {optimized.Length / 1024}KB");
        return optimized;
    }

    // ✅ HELPER: Estrae il JSON in modo robusto (gestisce markdown, testo extra, JSON troncato)
    private static string ExtractJson(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "{}";

        var s = raw.Trim();

        // 1. Rimuovi blocco markdown ```json ... ``` se presente
        if (s.StartsWith("```"))
        {
            var firstNewline = s.IndexOf('\n');
            var lastFence = s.LastIndexOf("```");
            if (firstNewline > 0 && lastFence > firstNewline)
            {
                s = s.Substring(firstNewline + 1, lastFence - firstNewline - 1).Trim();
            }
        }

        // 2. Trova il primo { e l'ultimo } (ignora testo prima/dopo)
        var start = s.IndexOf('{');
        var end = s.LastIndexOf('}');

        if (start == -1) return "{}";
        if (end == -1)
        {
            // JSON troncato (max_tokens raggiunto): chiudiamo le graffe mancanti
            s = s.Substring(start);
            var open = s.Count(c => c == '{');
            var close = s.Count(c => c == '}');
            s += new string('}', open - close);
            return s;
        }

        return s.Substring(start, end - start + 1);
    }

    public async Task<DevModeAnalysisResponse> AnalyzeAsync(DevModeAiRequest request)
    {
        var imageBytes = await GetDraftImageAsync(request.SiteParam, request.DraftId);
        var optimizedBytes = OptimizeImageForAI(imageBytes);
        var base64Image = Convert.ToBase64String(optimizedBytes);

        string yPercentStr = request.SelectedYPercent.HasValue
            ? request.SelectedYPercent.Value.ToString("F2")
            : "Intera pagina";
        string userPromptStr = string.IsNullOrWhiteSpace(request.UserPrompt) ? "Nessuna" : request.UserPrompt;

        string systemPrompt = _contextTemplate
            + "\n\nANALISI RICHIESTA:"
            + "\n- Sezione Y%: " + yPercentStr
            + "\n- Nota sviluppatore: " + userPromptStr
            + "\n\nRISPOSTA: SOLO un oggetto JSON valido con queste chiavi esatte:"
            + "\n{\n"
            + "  \"componentName\": \"string\",\n"
            + "  \"layoutClasses\": [\"string\"],\n"
            + "  \"scssImports\": [\"string\"],\n"
            + "  \"htmlSnippet\": \"string\",\n"
            + "  \"seoTags\": { \"h1\": \"string\", \"metaDesc\": \"string\" },\n"
            + "  \"techNotes\": \"string\"\n"
            + "}\n"
            + "Nessun testo fuori dal JSON. Nessun markdown. Nessun backtick.";

        var candidateModels = new[]
        {
            "gemini-3.8-flash",
            "gemini-3.5-flash",
            "gemini-3.1-flash",
            "gemini-2.5-flash",
            "gemini-1.5-flash"
        };

        DevModeAnalysisResponse? lastError = null;

        foreach (var model in candidateModels)
        {
            Console.WriteLine($"🔄 [AI] Provo modello: {model}");

            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new { text = systemPrompt },
                            new
                            {
                                inline_data = new
                                {
                                    mime_type = "image/jpeg",
                                    data = base64Image
                                }
                            }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.1,
                    maxOutputTokens = 2500,
                    responseMimeType = "application/json"  // ✅ JSON MODE NATIVO
                }
            };

            var geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={_apiKey}";

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, geminiUrl);
            httpRequest.Content = new StringContent(
                JsonSerializer.Serialize(payload, JsonOptions), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(httpRequest);

            if (!response.IsSuccessStatusCode)
            {
                var errBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"⚠️ [{model}] HTTP {(int)response.StatusCode}. Prossimo...");
                lastError = new DevModeAnalysisResponse
                {
                    Error = $"Modello {model} fallito ({response.StatusCode})",
                    ComponentName = "UNKNOWN"
                };
                continue;
            }

            var resultJson = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<GeminiResponse>(resultJson, JsonOptions);
            var rawContent = result?.Candidates?.FirstOrDefault()?.Content?.Parts?
                .FirstOrDefault(p => !string.IsNullOrEmpty(p.Text))?.Text ?? "{}";

            Console.WriteLine($"✅ [{model}] Risposta ricevuta ({rawContent.Length} chars). Parsing...");

            // ✅ PARSING ROBUSTO
            var cleanJson = ExtractJson(rawContent);

            try
            {
                var parsed = JsonSerializer.Deserialize<DevModeAnalysisResponse>(cleanJson, JsonOptions);
                if (parsed != null)
                {
                    Console.WriteLine($"🎉 [AI] SUCCESSO con modello {model}!");
                    return parsed;
                }
                throw new JsonException("Deserialization returned null");
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"❌ JSON invalido: {ex.Message}");
                Console.WriteLine($"📄 Contenuto grezzo: {cleanJson.Substring(0, Math.Min(500, cleanJson.Length))}");
                return new DevModeAnalysisResponse
                {
                    Error = $"JSON malformato: {ex.Message}",
                    ComponentName = "UNKNOWN",
                    TechNotes = cleanJson
                };
            }
        
        }

        return lastError ?? new DevModeAnalysisResponse { Error = "Nessun modello disponibile", ComponentName = "UNKNOWN" };
    }
}

public class GeminiResponse
{
    [JsonPropertyName("candidates")]
    public List<GeminiCandidate>? Candidates { get; set; }
}

public class GeminiCandidate
{
    [JsonPropertyName("content")]
    public GeminiContent? Content { get; set; }
}

public class GeminiContent
{
    [JsonPropertyName("parts")]
    public List<GeminiPart>? Parts { get; set; }
}

public class GeminiPart
{
    [JsonPropertyName("text")]
    public string? Text { get; set; }
}