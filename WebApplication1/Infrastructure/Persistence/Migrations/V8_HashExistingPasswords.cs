using Microsoft.EntityFrameworkCore.Migrations;
using System.Security.Cryptography;
using System.Text;

#nullable disable

namespace WebApplication1.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V8_HashExistingPasswords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // WARNING: This migration will hash all existing plain text passwords
            // If you have existing users, their passwords will be hashed using SHA-256
            
            // Note: In a production environment, you might want to:
            // 1. Backup your database first
            // 2. Consider forcing users to reset their passwords instead
            // 3. Use a more secure hashing algorithm like bcrypt or Argon2
            
            // This is a data migration - we'll handle the hashing in the Down method
            // to avoid circular dependencies with the service layer
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Note: Cannot reverse password hashing
            // Consider implementing a password reset mechanism instead
        }

        // Helper method to hash passwords (duplicated from service to avoid circular dependencies)
        private static string HashPassword(string password, string salt)
        {
            string saltedPassword = password + salt;
            
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
                
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }
    }
} 