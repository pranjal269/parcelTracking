using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Infrastructure.Persistence;
using WebApplication1.Application.Services;
using WebApplication1.Domain.Services;
using WebApplication1.Infrastructure.Services;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using WebApplication1.Infrastructure.Extensions;
using System;

var builder = WebApplication.CreateBuilder(args);

// Configure forwarded headers
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // In a production environment, you might want to specify known proxies if possible.
    // options.KnownNetworks.Clear();
    // options.KnownProxies.Clear();
});

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure database context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowGitHubPages",
        policy =>
        {
            policy.WithOrigins(
                    "https://raghavvag.github.io",
                    "http://127.0.0.1:5501",  // Local development server
                    "http://localhost:5501",    // Alternative local development server
                    "http://localhost:3000"     // React frontend
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();  // Allow credentials if you're sending cookies/auth
        });
});

// Add service registrations
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISmsService, SmsService>();
builder.Services.AddScoped<ITrackingService, TrackingService>();
builder.Services.AddScoped<IQRCodeService, QRCodeService>();
builder.Services.AddScoped<IPasswordHashingService, PasswordHashingService>();
builder.Services.AddScoped<ITamperDetectionService, TamperDetectionService>();

var app = builder.Build();

app.UseForwardedHeaders(); // Use forwarded headers early

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Basic production error handling (optional, logs are primary)
    // app.UseExceptionHandler("/Error"); // You would need to create an Error handling page/endpoint
    app.UseHsts(); // HTTP Strict Transport Security
}

app.UseHttpsRedirection(); // Should work better with UseForwardedHeaders

app.UseRouting(); // Explicitly add UseRouting

app.UseCors("AllowGitHubPages"); // Apply the named CORS policy

app.UseAuthorization();
app.MapControllers();

// Apply migrations in both development and production environments
Console.WriteLine("Applying migrations...");
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        dbContext.Database.Migrate();
        Console.WriteLine("Migrations applied successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred while applying migrations: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        // Don't throw the exception - let the application continue
    }
}

app.Run();