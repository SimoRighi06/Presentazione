namespace Presentazione.Api.Models;

// Come viene strutturati i dati nelle tabelle
public class Client
{
    public int Id {get;set;}
    public string Name {get; set;} = string.Empty;
    public string Slug {get; set;} = string.Empty;
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    public ICollection<PresentationConfig> Configs { get; set; } = new List<PresentationConfig>();

}