namespace Presentazione.Api.Models;

public class PresentationConfig
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;
    
    public string Title { get; set; } = string.Empty;
    public string Version { get; set; } = "v1";
    public string ConfigJson { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}