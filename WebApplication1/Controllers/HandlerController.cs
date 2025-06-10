using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HandlerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HandlerController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Handler/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] HandlerLoginRequest loginRequest)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginRequest.Email && u.Password == loginRequest.Password);

            if (user == null || (user.Role != "Handler" && user.Role != "Admin"))
            {
                return Unauthorized("Invalid credentials or insufficient permissions");
            }

            return Ok(new { message = "Login successful", user = new { user.Id, user.FirstName, user.LastName, user.Email, user.Role } });
        }

        // GET: api/Handler/shipments - Get all shipments for review
        [HttpGet("shipments")]
        public async Task<ActionResult<IEnumerable<object>>> GetShipmentsForReview()
        {
            var shipments = await _context.Shipments
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
                    s.UserEmail
                })
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return Ok(shipments);
        }

        // GET: api/Handler/shipments/in-transit - Get only in-transit shipments
        [HttpGet("shipments/in-transit")]
        public async Task<ActionResult<IEnumerable<object>>> GetInTransitShipments()
        {
            var shipments = await _context.Shipments
                .Where(s => s.Status == "In Transit")
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
                    s.UserEmail
                })
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return Ok(shipments);
        }

        // PUT: api/Handler/shipments/{id}/status - Update shipment status
        [HttpPut("shipments/{id}/status")]
        public async Task<IActionResult> UpdateShipmentStatus(int id, [FromBody] ShipmentStatusUpdateRequest request)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
            {
                return NotFound("Shipment not found");
            }

            shipment.Status = request.Status;
            if (!string.IsNullOrEmpty(request.CurrentAddress))
            {
                shipment.CurrentAddress = request.CurrentAddress;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Shipment status updated successfully", shipment });
        }

        // PUT: api/Handler/shipments/{id}/deliver - Mark shipment as delivered
        [HttpPut("shipments/{id}/deliver")]
        public async Task<IActionResult> MarkAsDelivered(int id, [FromBody] DeliveryConfirmation confirmation)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
            {
                return NotFound("Shipment not found");
            }

            shipment.Status = "Delivered";
            if (!string.IsNullOrEmpty(confirmation.DeliveryAddress))
            {
                shipment.CurrentAddress = confirmation.DeliveryAddress;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Shipment marked as delivered successfully", shipment });
        }
    }

    public class HandlerLoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ShipmentStatusUpdateRequest
    {
        public string Status { get; set; } = string.Empty;
        public string? CurrentAddress { get; set; }
    }

    public class DeliveryConfirmation
    {
        public string? DeliveryAddress { get; set; }
        public string? Notes { get; set; }
    }
} 