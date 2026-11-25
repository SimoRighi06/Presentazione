using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentazione.Api.Dtos;
using Presentazione.Api.Services;

namespace Presentazione.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
/* [Authorize] */ // ✅ Usa il JWT che hai già configurato
public class DevModeController : ControllerBase
{
    private readonly IDevModeAiService _aiService;
    private readonly ILogger<DevModeController> _logger;
    public DevModeController(IDevModeAiService aiService, ILogger<DevModeController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> Analyze([FromBody] DevModeAiRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SiteParam) || string.IsNullOrWhiteSpace(request.DraftId))
        {
            return BadRequest(new { error = "SiteParam e DraftId sono obbligatori" });
        }

        try
        {
            _logger.LogInformation("AI Analysis richiesta: {Site}/{Draft} @ Y={Y}", 
                request.SiteParam, request.DraftId, request.SelectedYPercent);

            var result = await _aiService.AnalyzeAsync(request);
            return Ok(result);
        }
        catch (FileNotFoundException ex)
        {
            _logger.LogWarning(ex, "Bozza non trovata: {Site}/{Draft}", request.SiteParam, request.DraftId);
            return NotFound(new { error = ex.Message });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Errore chiamata OpenAI");
            return StatusCode(502, new { error = "Servizio AI non raggiungibile", details = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore interno analisi AI");
            return StatusCode(500, new { error = "Errore interno", details = ex.Message });
        }
    }
}