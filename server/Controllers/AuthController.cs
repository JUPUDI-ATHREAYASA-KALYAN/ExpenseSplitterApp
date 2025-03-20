using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FullStackApp.Data;
using FullStackApp.DTOs;
using FullStackApp.Models;
using FullStackApp.Services;

namespace FullStackApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly PasswordService _passwordService;
        private readonly TokenService _tokenService;

        public AuthController(ApplicationDbContext context, PasswordService passwordService, TokenService tokenService)
        {
            _context = context;
            _passwordService = passwordService;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDTO>> Register(RegisterDTO registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return BadRequest("Email is already registered");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = registerDto.Name,
                Email = registerDto.Email.ToLower(),
                PasswordHash = _passwordService.HashPassword(registerDto.Password),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new AuthResponseDTO
            {
                Token = _tokenService.CreateToken(user),
                User = new UserDTO
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email
                }
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDTO>> Login(LoginDTO loginDto)
        {
            var user = await _context.Users
                .SingleOrDefaultAsync(u => u.Email == loginDto.Email.ToLower());

            if (user == null)
            {
                return Unauthorized("Invalid email or password");
            }

            if (!_passwordService.VerifyPassword(user.PasswordHash, loginDto.Password))
            {
                return Unauthorized("Invalid email or password");
            }

            return new AuthResponseDTO
            {
                Token = _tokenService.CreateToken(user),
                User = new UserDTO
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email
                }
            };
        }
    }
}
