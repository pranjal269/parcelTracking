using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Infrastructure.Persistence;
using WebApplication1.Domain.Entities;
using WebApplication1.Domain.Services;

namespace WebApplication1.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHashingService _passwordHashingService;

        public UserController(ApplicationDbContext context, IPasswordHashingService passwordHashingService)
        {
            _context = context;
            _passwordHashingService = passwordHashingService;
        }

        // POST: api/User
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            // Validate required fields
            if (string.IsNullOrWhiteSpace(user.Email) || 
                string.IsNullOrWhiteSpace(user.FirstName) || 
                string.IsNullOrWhiteSpace(user.LastName) || 
                string.IsNullOrWhiteSpace(user.Password))
            {
                return BadRequest(new { message = "All required fields must be provided" });
            }

            // Check if user with this email already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == user.Email.ToLower());

            if (existingUser != null)
            {
                return Conflict(new { message = "A user with this email already exists" });
            }

            // Validate email format
            if (!IsValidEmail(user.Email))
            {
                return BadRequest(new { message = "Please provide a valid email address" });
            }

            // Validate password length
            if (user.Password.Length < 6)
            {
                return BadRequest(new { message = "Password must be at least 6 characters long" });
            }

            try
            {
                // Set default role if not provided
                if (string.IsNullOrWhiteSpace(user.Role))
                {
                    user.Role = "User";
                }

                // Hash the password before storing
                user.Password = _passwordHashingService.HashPassword(user.Password);

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Return user without password for security
                var responseUser = new
                {
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    phoneNumber = user.PhoneNumber,
                    role = user.Role
                };

                return CreatedAtAction("CreateUser", new { id = user.Id }, responseUser);
            }
            catch (DbUpdateException ex)
            {
                // Handle database constraint violations
                if (ex.InnerException?.Message.Contains("duplicate key") == true)
                {
                    return Conflict(new { message = "A user with this email already exists" });
                }
                
                return StatusCode(500, new { message = "An error occurred while creating the user" });
            }
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}