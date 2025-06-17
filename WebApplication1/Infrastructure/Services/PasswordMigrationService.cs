using Microsoft.EntityFrameworkCore;
using WebApplication1.Domain.Services;
using WebApplication1.Infrastructure.Persistence;

namespace WebApplication1.Infrastructure.Services
{
    public class PasswordMigrationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHashingService _passwordHashingService;

        public PasswordMigrationService(ApplicationDbContext context, IPasswordHashingService passwordHashingService)
        {
            _context = context;
            _passwordHashingService = passwordHashingService;
        }

        /// <summary>
        /// Migrate plain text passwords to hashed passwords
        /// WARNING: Use this only for development/testing environments
        /// </summary>
        public async Task MigratePlaintextPasswordsAsync()
        {
            var users = await _context.Users.ToListAsync();
            
            foreach (var user in users)
            {
                // Check if password is already hashed (simple check: hashed passwords are 64 chars long)
                if (user.Password.Length != 64)
                {
                    // Assuming this is a plain text password, hash it
                    user.Password = _passwordHashingService.HashPassword(user.Password);
                }
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Force all users to reset their passwords by setting passwords to null
        /// More secure approach for production environments
        /// </summary>
        public async Task ForcePasswordResetAsync()
        {
            var users = await _context.Users.ToListAsync();
            
            foreach (var user in users)
            {
                // Set a temporary hash that forces reset
                user.Password = _passwordHashingService.HashPassword("RESET_REQUIRED_" + Guid.NewGuid().ToString());
            }

            await _context.SaveChangesAsync();
        }
    }
} 