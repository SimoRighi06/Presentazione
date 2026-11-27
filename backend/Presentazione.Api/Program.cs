using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Presentazione.Api.Data;
using System.Text;
using Presentazione.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurazione del Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=presentationhub.db;Cache=Shared;",
        sqliteOptions => sqliteOptions.CommandTimeout(30)
    ));

// 2. Configurazione JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "chiave-presentazione-26-!-tecnoprogress";
var key = Encoding.UTF8.GetBytes(jwtSecret);


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "PresentazioneApi",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "PresentazioneFrontend",
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddHttpClient<IDevModeAiService, DevModeAiService>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(3); // Timeout ragionevole per GPT-4o Vision
});
builder.Services.AddOpenApi();

// 3. CORS con credenziali (FONDAMENTALE per far passare il token dal frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:4173",
            "https://presentazionetp.vercel.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials(); // ✅ Questa riga era mancante ed è obbligatoria
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// 4. Middleware di sicurezza (DEVONO stare prima di MapControllers)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 5. SEEDING ADMIN (Crea l'admin al primo avvio se non esiste)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();

    if (!context.AdminUsers.Any(u => u.Username == "admin"))
    {
        var realHash = BCrypt.Net.BCrypt.HashPassword("Presentazione26!", 11);
        context.AdminUsers.Add(new Presentazione.Api.Models.AdminUser
        {
            Username = "admin",
            PasswordHash = realHash,
            CreatedAt = DateTime.UtcNow
        });
        context.SaveChanges();
        Console.WriteLine("✅ Admin creato con successo con hash BCrypt valido!");
    }
}

app.Run();

// Endpoint di test pubblico (opzionale, puoi lasciarlo o rimuoverlo)
var summaries = new[] { "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching" };
app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast(DateOnly.FromDateTime(DateTime.Now.AddDays(index)), Random.Shared.Next(-20, 55), summaries[Random.Shared.Next(summaries.Length)]))
    .ToArray();
    return forecast;
}).WithName("GetWeatherForecast");

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

