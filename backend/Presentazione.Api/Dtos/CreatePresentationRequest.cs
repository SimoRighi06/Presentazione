using System.Text.Json;
namespace Presentazione.Api.Dtos;


// ciò che è necessario per ogni cliente. nome del cliente e JSON 

public class CreatePresentationRequest
{
    public string ClientName { get; set; } = string.Empty;
    public string ClientSlug { get; set; } = string.Empty; 
    public string Title { get; set; } = string.Empty;      
    public string Version { get; set; } = "v1";
    public string ConfigJson { get; set; } = string.Empty; // Torniamo a string
}
