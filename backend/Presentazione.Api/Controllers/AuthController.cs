using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Presentazione.Api.Data;
using Presentazione.Api.Dtos;
using Presentazione.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Presentazione.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // 1. Validazione base
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Dati non validi" });
        }

        // 2. Cerca l'utente (query parametrizzata da EF Core)
        var user = await _context.AdminUsers
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null)
        {
            // Risposta generica per non rivelare se l'utente esiste
            return Unauthorized(new { message = "Credenziali non valide" });
        }

        // 3. Verifica password con BCrypt (timing-safe)
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Credenziali non valide" });
        }

        // 4. Genera JWT Token
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(
            _configuration["Jwt:Secret"] ?? "chiave-presentazione-26-!-tecnoprogress"
        );

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, "Admin")
            }),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            ),
            Issuer = _configuration["Jwt:Issuer"] ?? "PresentazioneApi",
            Audience = _configuration["Jwt:Audience"] ?? "PresentazioneFrontend"
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Ok(new LoginResponse
        {
            Token = tokenHandler.WriteToken(token),
            Username = user.Username,
            ExpiresAt = tokenDescriptor.Expires.Value
        });
    }
}