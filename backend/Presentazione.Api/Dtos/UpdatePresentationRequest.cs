namespace Presentazione.Api.Dtos;

public class UpdatePresentationRequest
{
    // opzionali ?
    public string? Title { get; set; }
    public string? Version { get; set; }
    public string? ConfigJson { get; set; } 
}