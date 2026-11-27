namespace Presentazione.Api.Dtos;

public class DevModeAnalysisResponse
{
    public string ComponentName { get; set; } = string.Empty;
    public List<string> LayoutClasses { get; set; } = new();
    public List<string> ScssImports { get; set; } = new();
    public string HtmlSnippet { get; set; } = string.Empty;
    public SeoTags? SeoTags { get; set; }
    public string TechNotes { get; set; } = string.Empty;
    public string? Error { get; set; } // Per fallback graceful
}

public class SeoTags
{
    public string H1 { get; set; } = string.Empty;
    public string MetaDesc { get; set; } = string.Empty;
}