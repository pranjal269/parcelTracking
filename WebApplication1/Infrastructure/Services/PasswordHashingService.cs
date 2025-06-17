using System.Security.Cryptography;
using System.Text;
using WebApplication1.Domain.Services;

namespace WebApplication1.Infrastructure.Services
{
    public class PasswordHashingService : IPasswordHashingService
    {
        private readonly string _salt;

        public PasswordHashingService(IConfiguration configuration)
        {
            // Get salt from configuration or use a default one
            // In production, store this securely in appsettings.json or environment variables
            _salt = configuration.GetValue<string>("PasswordSalt") ?? "YourSecureSaltHere2024!";
        }

        public string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("Password cannot be null or empty", nameof(password));

            // Combine password with salt
            string saltedPassword = password + _salt;

            // Create SHA256 hash
            using (SHA256 sha256Hash = SHA256.Create())
            {
                // Compute hash from the salted password
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));

                // Convert byte array to hexadecimal string
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hashedPassword))
                return false;

            // Hash the input password and compare with stored hash
            string hashedInputPassword = HashPassword(password);
            
            // Use secure string comparison to prevent timing attacks
            return SecureStringCompare(hashedInputPassword, hashedPassword);
        }

        private static bool SecureStringCompare(string a, string b)
        {
            if (a.Length != b.Length)
                return false;

            int result = 0;
            for (int i = 0; i < a.Length; i++)
            {
                result |= a[i] ^ b[i];
            }
            
            return result == 0;
        }
    }
} 