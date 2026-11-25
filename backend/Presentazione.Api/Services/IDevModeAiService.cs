namespace Presentazione.Api.Services;

using Presentazione.Api.Dtos;

public interface IDevModeAiService
{
    Task<DevModeAnalysisResponse> AnalyzeAsync(DevModeAiRequest request);
}