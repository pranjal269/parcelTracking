using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;

namespace WebApplication1.Extensions
{
    public static class MigrationManager
    {
        public static IHost MigrateDatabase(this IHost host)
        {
            using (var scope = host.Services.CreateScope())
            {
                try
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    
                    // Apply migrations if they are not applied
                    if (context.Database.GetPendingMigrations().Any())
                    {
                        context.Database.Migrate();
                        Console.WriteLine("Database migrations applied successfully.");
                    }
                    else
                    {
                        Console.WriteLine("No pending migrations found.");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occurred while migrating the database: {ex.Message}");
                    throw;
                }
            }

            return host;
        }
    }
}
