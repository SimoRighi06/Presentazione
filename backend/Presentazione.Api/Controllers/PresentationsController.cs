using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Presentazione.Api.Data;
using Presentazione.Api.Dtos;
using Presentazione.Api.Models;

namespace Presentazione.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PresentationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PresentationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("clients")]
    [AllowAnonymous]
    public async Task<IActionResult> GetClients()
    {
        var clients = await _context.Clients
            .AsNoTracking()
            .Select(c => new { c.Name, c.Slug })
            .OrderBy(c => c.Name)
            .ToListAsync();

        return Ok(clients);
    }

    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPresentation(string slug)
    {
        var client = await _context.Clients
            .Include(c => c.Configs)
            .FirstOrDefaultAsync(c => c.Slug == slug);

        if (client == null) return NotFound(new { message = "Cliente non trovato." });

        var latestConfig = client.Configs
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefault();

        if (latestConfig == null) return NotFound(new { message = "Nessuna configurazione trovata." });

        return Ok(new 
        { 
            client.Name, 
            client.Slug, 
            latestConfig.Title, 
            latestConfig.Version, 
            latestConfig.ConfigJson 
        });
    }

    // 2. POST: Crea una nuova configurazione
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreatePresentation([FromBody] CreatePresentationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ClientSlug) || string.IsNullOrWhiteSpace(request.ConfigJson))
        {
            return BadRequest(new { message = "ClientSlug e ConfigJson sono obbligatori." });
        }

        var client = await _context.Clients.FirstOrDefaultAsync(c => c.Slug == request.ClientSlug);

        if (client == null)
        {
            client = new Client
            {
                Name = string.IsNullOrWhiteSpace(request.ClientName) ? request.ClientSlug : request.ClientName,
                Slug = request.ClientSlug
            };
            _context.Clients.Add(client);
            await _context.SaveChangesAsync();
        }

        var newConfig = new PresentationConfig
        {
            ClientId = client.Id,
            Title = request.Title,
            Version = request.Version,
            ConfigJson = request.ConfigJson
        };

        _context.PresentationConfigs.Add(newConfig);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPresentation), new { slug = client.Slug }, new 
        { 
            message = "Salvato con successo!",
            configId = newConfig.Id 
        });
    }

    // 3. PUT: Aggiorna una configurazione esistente
    [HttpPut("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdatePresentation(string slug, [FromBody] UpdatePresentationRequest request)
    {
        var client = await _context.Clients
            .Include(c => c.Configs)
            .FirstOrDefaultAsync(c => c.Slug == slug);

        if (client == null) 
            return NotFound(new { message = "Cliente non trovato." });

        var latestConfig = client.Configs.OrderByDescending(c => c.CreatedAt).FirstOrDefault();

        if (latestConfig == null) 
            return NotFound(new { message = "Nessuna configurazione trovata da aggiornare." });

        // Aggiorna SOLO i campi che sono stati effettivamente inviati
        if (!string.IsNullOrWhiteSpace(request.Title)) 
            latestConfig.Title = request.Title;
            
        if (!string.IsNullOrWhiteSpace(request.Version)) 
            latestConfig.Version = request.Version;
            
        if (!string.IsNullOrWhiteSpace(request.ConfigJson)) 
            latestConfig.ConfigJson = request.ConfigJson;

        latestConfig.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new 
        { 
            message = "Configurazione aggiornata con successo!", 
            configId = latestConfig.Id 
        });
    }
}