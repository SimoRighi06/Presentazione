using Microsoft.AspNetCore.Mvc;
using Presentazione.Api.Data;
using Presentazione.Api.Models;

namespace Presentazione.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SetupController : ControllerBase
{
    private readonly AppDbContext _context;

    public SetupController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("create-admin")]
    public IActionResult CreateAdmin([FromBody] CreateAdminRequest request)
    {
        // Verifica se esiste già
        if (_context.AdminUsers.Any(u => u.Username == request.Username))
        {
            return BadRequest(new { message = "Admin già esistente" });
        }

        var hash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 11);
        
        var admin = new AdminUser
        {
            Username = request.Username,
            PasswordHash = hash,
            CreatedAt = DateTime.UtcNow
        };

        _context.AdminUsers.Add(admin);
        _context.SaveChanges();

        return Ok(new { message = "Admin creato con successo!" });
    }
}

public class CreateAdminRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}