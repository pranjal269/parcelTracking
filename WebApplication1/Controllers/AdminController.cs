using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Admin/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AdminLoginRequest loginRequest)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginRequest.Email && u.Password == loginRequest.Password);

            if (user == null || user.Role != "Admin")
            {
                return Unauthorized("Invalid credentials or insufficient permissions");
            }

            return Ok(new { message = "Admin login successful", user = new { user.Id, user.FirstName, user.LastName, user.Email, user.Role } });
        }

        // GET: api/Admin/dashboard - Get dashboard overview
        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetDashboard()
        {
            var totalShipments = await _context.Shipments.CountAsync();
            var pendingShipments = await _context.Shipments.CountAsync(s => s.Status == "Pending");
            var inTransitShipments = await _context.Shipments.CountAsync(s => s.Status == "In Transit");
            var deliveredShipments = await _context.Shipments.CountAsync(s => s.Status == "Delivered");
            var totalUsers = await _context.Users.CountAsync(u => u.Role == "User");
            var totalHandlers = await _context.Users.CountAsync(u => u.Role == "Handler");

            var recentShipments = await _context.Shipments
                .OrderByDescending(s => s.CreatedAt)
                .Take(10)
                .Select(s => new
                {
                    s.Id,
                    s.TrackingId,
                    s.RecipientName,
                    s.Status,
                    s.CreatedAt,
                    s.UserEmail
                })
                .ToListAsync();

            return Ok(new
            {
                statistics = new
                {
                    totalShipments,
                    pendingShipments,
                    inTransitShipments,
                    deliveredShipments,
                    totalUsers,
                    totalHandlers
                },
                recentShipments
            });
        }

        // GET: api/Admin/shipments - Get all shipments with filters
        [HttpGet("shipments")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllShipments([FromQuery] string? status = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var query = _context.Shipments.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(s => s.Status == status);
            }

            var shipments = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new
                {
                    s.Id,
                    s.TrackingId,
                    s.RecipientName,
                    s.DeliveryAddress,
                    s.CurrentAddress,
                    s.PackageType,
                    s.Weight,
                    s.SpecialInstructions,
                    s.Status,
                    s.CreatedAt,
                    s.UserEmail,
                    s.UserId
                })
                .ToListAsync();

            var totalCount = await query.CountAsync();

            return Ok(new
            {
                shipments,
                totalCount,
                currentPage = page,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        // GET: api/Admin/users - Get all users
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.PhoneNumber,
                    u.Role,
                    ShipmentCount = _context.Shipments.Count(s => s.UserId == u.Id)
                })
                .OrderBy(u => u.Role)
                .ThenBy(u => u.LastName)
                .ToListAsync();

            return Ok(users);
        }

        // PUT: api/Admin/users/{id}/role - Update user role
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UserRoleUpdateRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("User not found");
            }

            if (!new[] { "User", "Handler", "Admin" }.Contains(request.Role))
            {
                return BadRequest("Invalid role. Must be User, Handler, or Admin");
            }

            user.Role = request.Role;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User role updated successfully", user = new { user.Id, user.Email, user.Role } });
        }

        // DELETE: api/Admin/shipments/{id} - Delete shipment (admin only)
        [HttpDelete("shipments/{id}")]
        public async Task<IActionResult> DeleteShipment(int id)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
            {
                return NotFound("Shipment not found");
            }

            // Also delete related OTPs
            var otps = await _context.DeliveryOtps.Where(o => o.ShipmentId == id).ToListAsync();
            _context.DeliveryOtps.RemoveRange(otps);
            
            _context.Shipments.Remove(shipment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Shipment deleted successfully" });
        }

        // GET: api/Admin/analytics - Get analytics data
        [HttpGet("analytics")]
        public async Task<ActionResult<object>> GetAnalytics()
        {
            var last30Days = DateTime.UtcNow.AddDays(-30);
            
            var shipmentsPerDay = await _context.Shipments
                .Where(s => s.CreatedAt >= last30Days)
                .GroupBy(s => s.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            var statusDistribution = await _context.Shipments
                .GroupBy(s => s.Status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var topPackageTypes = await _context.Shipments
                .GroupBy(s => s.PackageType)
                .Select(g => new
                {
                    PackageType = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            return Ok(new
            {
                shipmentsPerDay,
                statusDistribution,
                topPackageTypes
            });
        }
    }

    public class AdminLoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UserRoleUpdateRequest
    {
        public string Role { get; set; } = string.Empty;
    }
} 