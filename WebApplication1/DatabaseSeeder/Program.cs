using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Cryptography;
using System.Text;

namespace SimpleSeeder
{
    // Simple User entity for seeding
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        public string Email { get; set; } = string.Empty;
        
        public string PhoneNumber { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = "User";
    }

    // Simple DbContext for seeding
    public class SeederDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }

        public SeederDbContext(DbContextOptions<SeederDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }

    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("🌱 Starting Simple Database Seeder...");

            // Build configuration
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Path.GetFullPath("../"))
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");
            var salt = configuration["PasswordSalt"] ?? "ParcelTracker2024!SecureSalt#SHA256";

            var optionsBuilder = new DbContextOptionsBuilder<SeederDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            try
            {
                using var context = new SeederDbContext(optionsBuilder.Options);

                Console.WriteLine("📊 Ensuring database exists...");
                await context.Database.EnsureCreatedAsync();

                Console.WriteLine("🗑️  Clearing existing users...");
                context.Users.RemoveRange(context.Users);
                await context.SaveChangesAsync();

                Console.WriteLine("👥 Creating default users...");

                var defaultUsers = new List<User>
                {
                    new User
                    {
                        FirstName = "System",
                        LastName = "Administrator", 
                        Email = "admin@parcel.com",
                        PhoneNumber = "+1234567890",
                        Password = HashPassword("password123", salt),
                        Role = "admin"
                    },
                    new User
                    {
                        FirstName = "Package",
                        LastName = "Handler",
                        Email = "handler@parcel.com",
                        PhoneNumber = "+1234567891", 
                        Password = HashPassword("password123", salt),
                        Role = "handler"
                    },
                    new User
                    {
                        FirstName = "Test",
                        LastName = "User",
                        Email = "user@test.com",
                        PhoneNumber = "+1234567892",
                        Password = HashPassword("password123", salt),
                        Role = "User"
                    }
                };

                context.Users.AddRange(defaultUsers);
                await context.SaveChangesAsync();

                Console.WriteLine("✅ Created admin user: admin@parcel.com");
                Console.WriteLine("✅ Created handler user: handler@parcel.com");
                Console.WriteLine("✅ Created test user: user@test.com");

                Console.WriteLine("\n🎉 Database seeding completed successfully!");
                Console.WriteLine("\n📋 Default Login Credentials:");
                Console.WriteLine("┌─────────────────────────────────────────┐");
                Console.WriteLine("│ Admin Access:                           │");
                Console.WriteLine("│ Email: admin@parcel.com                 │");
                Console.WriteLine("│ Password: password123                   │");
                Console.WriteLine("├─────────────────────────────────────────┤");
                Console.WriteLine("│ Handler Access:                         │");
                Console.WriteLine("│ Email: handler@parcel.com               │");
                Console.WriteLine("│ Password: password123                   │");
                Console.WriteLine("├─────────────────────────────────────────┤");
                Console.WriteLine("│ User Access:                            │");
                Console.WriteLine("│ Email: user@test.com                    │");
                Console.WriteLine("│ Password: password123                   │");
                Console.WriteLine("└─────────────────────────────────────────┘");
                Console.WriteLine("\n🚀 You can now start the backend server!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error seeding database: {ex.Message}");
                Console.WriteLine($"📝 Stack trace: {ex.StackTrace}");
            }
        }

        private static string HashPassword(string password, string salt)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("Password cannot be null or empty", nameof(password));

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