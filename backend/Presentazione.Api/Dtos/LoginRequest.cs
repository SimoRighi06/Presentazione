using System.ComponentModel.DataAnnotations;

namespace Presentazione.Api.Dtos;

public class LoginRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username{ get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 6)]
    public string Password { get; set;} =string.Empty;
}