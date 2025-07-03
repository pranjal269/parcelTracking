using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Infrastructure.Persistence;
using WebApplication1.Domain.Entities;
using WebApplication1.Domain.Services;

namespace WebApplication1.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HandlerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHashingService _passwordHashingService;
        private readonly ITamperDetectionService _tamperDetectionService;

        public HandlerController(ApplicationDbContext context, IPasswordHashingService passwordHashingService, ITamperDetectionService tamperDetectionService)
        {
            _context = context;
            _passwordHashingService = passwordHashingService;
            _tamperDetectionService = tamperDetectionService;
        }

        // POST: api/Handler/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] HandlerLoginRequest loginRequest)
        {
            // Find user by email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginRequest.Email);

            // Check if user exists, verify password hash, and check handler/admin role
            if (user == null || !_passwordHashingService.VerifyPassword(loginRequest.Password, user.Password) || (user.Role != "Handler" && user.Role != "Admin"))
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
                    s.UserEmail,
                    s.IsTampered,
                    s.TamperReason,
                    s.TamperDetectedAt,
                    s.TamperDetectedBy,
                    s.StatusHistory,
                    s.PickedUpAt,
                    s.InTransitAt,
                    s.OutForDeliveryAt,
                    s.DeliveredAt,
                    s.WasDeliveredWithTamper
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
                    s.UserEmail,
                    s.IsTampered,
                    s.TamperReason,
                    s.StatusHistory,
                    s.PickedUpAt,
                    s.InTransitAt,
                    s.OutForDeliveryAt,
                    s.DeliveredAt
                })
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return Ok(shipments);
        }

        // PUT: api/Handler/shipments/{id}/status - Update shipment status with tamper detection
        [HttpPut("shipments/{id}/status")]
        public async Task<IActionResult> UpdateShipmentStatus(int id, [FromBody] ShipmentStatusUpdateRequest request)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
            {
                return NotFound("Shipment not found");
            }

            var handlerUser = request.HandlerEmail ?? "Unknown Handler";
            
            // Check for tamper detection
            bool isTamperDetected = _tamperDetectionService.IsTamperDetected(shipment.Status, request.Status, shipment.StatusHistory);
            
            if (isTamperDetected)
            {
                // Mark as tampered
                shipment.IsTampered = true;
                shipment.TamperReason = _tamperDetectionService.GetTamperReason(shipment.Status, request.Status, shipment.StatusHistory);
                shipment.TamperDetectedAt = DateTime.UtcNow;
                shipment.TamperDetectedBy = handlerUser;
                
                await _context.SaveChangesAsync();
                
                return BadRequest(new { 
                    message = "Workflow violation detected! Shipment marked as tampered.", 
                    tamperReason = shipment.TamperReason,
                    isTampered = true
                });
            }

            // Update status and history
            shipment.Status = request.Status;
            shipment.StatusHistory = _tamperDetectionService.UpdateStatusHistory(shipment.StatusHistory, request.Status);
            
            // Update timestamps based on status
            switch (request.Status)
            {
                case "Picked Up":
                    shipment.PickedUpAt = DateTime.UtcNow;
                    break;
                case "In Transit":
                    shipment.InTransitAt = DateTime.UtcNow;
                    break;
                case "Out for Delivery":
                    shipment.OutForDeliveryAt = DateTime.UtcNow;
                    break;
                case "Delivered":
                    shipment.DeliveredAt = DateTime.UtcNow;
                    break;
            }
            
            // Update current address if provided
            if (!string.IsNullOrEmpty(request.CurrentAddress))
            {
                shipment.CurrentAddress = request.CurrentAddress;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Shipment status updated successfully", shipment });
        }

        // POST: api/Handler/shipments/{id}/mark-tampered - Manually mark as tampered
        [HttpPost("shipments/{id}/mark-tampered")]
        public async Task<IActionResult> MarkAsTampered(int id, [FromBody] TamperReportRequest request)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
            {
                return NotFound("Shipment not found");
            }

            // Mark as tampered
            shipment.IsTampered = true;
            shipment.TamperReason = request.Reason ?? "Manually marked as tampered by handler";
            shipment.TamperDetectedAt = DateTime.UtcNow;
            shipment.TamperDetectedBy = request.HandlerEmail ?? "Unknown Handler";
            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Shipment marked as tampered successfully", shipment });
        }

        // GET: api/Handler/workflow-steps - Get valid workflow steps
        [HttpGet("workflow-steps")]
        public ActionResult<List<string>> GetWorkflowSteps()
        {
            return Ok(_tamperDetectionService.GetValidWorkflowSteps());
        }

        // PUT: api/Handler/shipments/{id}/force-deliver - Force deliver tampered package
        [HttpPut("shipments/{id}/force-deliver")]
        public async Task<IActionResult> ForceDeliverTamperedPackage(int id, [FromBody] DeliveryConfirmation confirmation)
        {
            // First verify that a valid OTP was provided
            if (string.IsNullOrEmpty(confirmation.Otp))
            {
                return BadRequest(new { message = "OTP is required for delivery verification, even for tampered packages" });
            }
            
            // Verify the OTP
            var otp = await _context.DeliveryOtps
                .FirstOrDefaultAsync(o => o.ShipmentId == id && o.Otp == confirmation.Otp && !o.IsUsed);
                
            if (otp == null)
            {
                return BadRequest(new { message = "Invalid or already used OTP. Verification required even for tampered packages." });
            }
            
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
            {
                return NotFound("Shipment not found");
            }

            var handlerUser = confirmation.HandlerEmail ?? "Unknown Handler";
            
            // Force deliver as tampered - bypass all workflow validation
            shipment.Status = "Delivered_Tampered";
            shipment.StatusHistory = _tamperDetectionService.UpdateStatusHistory(shipment.StatusHistory, "Delivered_Tampered");
            shipment.DeliveredAt = DateTime.UtcNow;
            shipment.WasDeliveredWithTamper = true;
            
            // If not already marked as tampered, mark it now
            if (!shipment.IsTampered)
            {
                shipment.IsTampered = true;
                shipment.TamperReason = "Package force-delivered by handler despite workflow violations";
                shipment.TamperDetectedAt = DateTime.UtcNow;
                shipment.TamperDetectedBy = handlerUser;
            }
            
            if (!string.IsNullOrEmpty(confirmation.DeliveryAddress))
            {
                shipment.CurrentAddress = confirmation.DeliveryAddress;
            }
            
            // Mark the OTP as used
            otp.IsUsed = true;

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Package force-delivered as tampered after OTP verification", 
                shipment,
                warning = "This shipment was delivered despite tampering concerns. Recipient will be notified."
            });
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

            var handlerUser = confirmation.HandlerEmail ?? "Unknown Handler";
            
            // Check if this should be delivered as tampered
            bool shouldDeliverAsTampered = _tamperDetectionService.ShouldDeliverAsTampered(shipment.IsTampered, shipment.Status, "Delivered");
            
            if (shouldDeliverAsTampered)
            {
                // Deliver as tampered - no workflow validation needed
                shipment.Status = "Delivered_Tampered";
                shipment.StatusHistory = _tamperDetectionService.UpdateStatusHistory(shipment.StatusHistory, "Delivered_Tampered");
                shipment.DeliveredAt = DateTime.UtcNow;
                shipment.WasDeliveredWithTamper = true;
                
                if (!string.IsNullOrEmpty(confirmation.DeliveryAddress))
                {
                    shipment.CurrentAddress = confirmation.DeliveryAddress;
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Tampered shipment delivered successfully", 
                    shipment,
                    warning = "This shipment was delivered despite being marked as tampered"
                });
            }
            
            // Check for tamper detection when marking as delivered (for non-tampered packages)
            bool isTamperDetected = _tamperDetectionService.IsTamperDetected(shipment.Status, "Delivered", shipment.StatusHistory);
            
            if (isTamperDetected)
            {
                // Mark as tampered
                shipment.IsTampered = true;
                shipment.TamperReason = _tamperDetectionService.GetTamperReason(shipment.Status, "Delivered", shipment.StatusHistory);
                shipment.TamperDetectedAt = DateTime.UtcNow;
                shipment.TamperDetectedBy = handlerUser;
                
                await _context.SaveChangesAsync();
                
                return BadRequest(new { 
                    message = "Workflow violation detected! Cannot mark as delivered. Shipment marked as tampered.", 
                    tamperReason = shipment.TamperReason,
                    isTampered = true,
                    canDeliverAnyway = true
                });
            }

            // Normal delivery
            shipment.Status = "Delivered";
            shipment.StatusHistory = _tamperDetectionService.UpdateStatusHistory(shipment.StatusHistory, "Delivered");
            shipment.DeliveredAt = DateTime.UtcNow;
            
            if (!string.IsNullOrEmpty(confirmation.DeliveryAddress))
            {
                shipment.CurrentAddress = confirmation.DeliveryAddress;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Shipment marked as delivered successfully", shipment });
        }

        // GET: api/Handler/statistics - Get tamper detection statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetTamperStatistics()
        {
            var totalShipments = await _context.Shipments.CountAsync();
            var tamperedShipments = await _context.Shipments.CountAsync(s => s.IsTampered);
            var pendingShipments = await _context.Shipments.CountAsync(s => s.Status == "Pending");
            var inTransitShipments = await _context.Shipments.CountAsync(s => s.Status == "In Transit");
            var deliveredShipments = await _context.Shipments.CountAsync(s => s.Status == "Delivered");
            var tamperedDeliveredShipments = await _context.Shipments.CountAsync(s => s.Status == "Delivered_Tampered");

            var tamperRate = totalShipments > 0 ? (double)tamperedShipments / totalShipments * 100 : 0;

            return Ok(new
            {
                totalShipments,
                tamperedShipments,
                tamperRate = Math.Round(tamperRate, 2),
                statusBreakdown = new
                {
                    pending = pendingShipments,
                    inTransit = inTransitShipments,
                    delivered = deliveredShipments,
                    deliveredTampered = tamperedDeliveredShipments
                }
            });
        }

        // GET: api/Handler/shipments/tampered - Get only tampered shipments
        [HttpGet("shipments/tampered")]
        public async Task<ActionResult<IEnumerable<object>>> GetTamperedShipments()
        {
            var shipments = await _context.Shipments
                .Where(s => s.IsTampered)
                .Select(s => new
                {
                    s.Id,
                    s.TrackingId,
                    s.RecipientName,
                    s.DeliveryAddress,
                    s.CurrentAddress,
                    s.PackageType,
                    s.Weight,
                    s.Status,
                    s.CreatedAt,
                    s.UserEmail,
                    s.IsTampered,
                    s.TamperReason,
                    s.TamperDetectedAt,
                    s.TamperDetectedBy,
                    s.StatusHistory
                })
                .OrderByDescending(s => s.TamperDetectedAt)
                .ToListAsync();

            return Ok(shipments);
        }
        
        // Handler OTP generation endpoint
        [HttpPost("shipments/{id}/generate-otp")]
        public async Task<IActionResult> GenerateDeliveryOtp(int id)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
            {
                return NotFound("Shipment not found.");
            }

            // Get user details for SMS
            var user = await _context.Users.FindAsync(shipment.UserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Generate OTP
            var trackingService = HttpContext.RequestServices.GetRequiredService<WebApplication1.Application.Services.ITrackingService>();
            var smsService = HttpContext.RequestServices.GetRequiredService<WebApplication1.Application.Services.ISmsService>();
            
            // Generate a new OTP
            string otpCode = trackingService.GenerateOtp();
            
            // Save OTP to database
            var otp = new DeliveryOtp
            {
                Otp = otpCode,
                ShipmentId = id
            };

            _context.DeliveryOtps.Add(otp);
            await _context.SaveChangesAsync();

            // Log detailed information about the shipment
            Console.WriteLine($"Shipment ID: {shipment.Id}");
            Console.WriteLine($"Recipient Name: {shipment.RecipientName}");
            Console.WriteLine($"Recipient Phone: {shipment.RecipientPhoneNumber}");
            Console.WriteLine($"Sender Email: {shipment.UserEmail}");
            Console.WriteLine($"Sender Phone: {user.PhoneNumber}");

            // Try to send OTP via SMS to the recipient
            try
            {
                // First try to use recipient's phone number, fall back to sender's only if necessary
                string phoneNumber = !string.IsNullOrEmpty(shipment.RecipientPhoneNumber) 
                    ? shipment.RecipientPhoneNumber 
                    : user.PhoneNumber;
                    
                if (!string.IsNullOrEmpty(phoneNumber))
                {
                    string smsMessage = $"Your delivery OTP for parcel {shipment.TrackingId} is: {otpCode}. Use this to confirm delivery.";
                    await smsService.SendSmsAsync(phoneNumber, smsMessage);
                    
                    // Update shipment status to Out for Delivery
                    if (shipment.Status != "Out for Delivery")
                    {
                        shipment.Status = "Out for Delivery";
                        shipment.OutForDeliveryAt = DateTime.UtcNow;
                        shipment.StatusHistory = _tamperDetectionService.UpdateStatusHistory(shipment.StatusHistory, "Out for Delivery");
                        await _context.SaveChangesAsync();
                    }
                    
                    return Ok(new { 
                        message = "OTP generated and sent successfully to recipient's phone", 
                        recipientPhone = shipment.RecipientPhoneNumber
                        // OTP is no longer included in the response
                    });
                }
                else
                {
                    return BadRequest(new {
                        message = "No recipient phone number available for sending OTP. Please update the shipment with a valid recipient phone number.",
                        recipientPhone = shipment.RecipientPhoneNumber,
                        senderPhone = user.PhoneNumber
                    });
                }
            }
            catch (Exception ex)
            {
                // Log the SMS error
                Console.WriteLine($"SMS notification failed for OTP {otpCode}: {ex.Message}");
                return StatusCode(500, new { 
                    message = "Failed to send OTP via SMS", 
                    error = ex.Message,
                    recipientPhone = shipment.RecipientPhoneNumber
                    // OTP is no longer included in the response
                });
            }
        }
        
        // Handler OTP verification endpoint
        [HttpPost("shipments/{id}/verify-otp")]
        public async Task<IActionResult> VerifyDeliveryOtp(int id, [FromBody] HandlerOtpVerificationRequest request)
        {
            var otp = await _context.DeliveryOtps
                .FirstOrDefaultAsync(o => o.ShipmentId == id && o.Otp == request.Otp && !o.IsUsed);

            if (otp == null)
            {
                return BadRequest("Invalid or already used OTP.");
            }

            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
            {
                return NotFound("Shipment not found.");
            }

            // Mark OTP as used
            otp.IsUsed = true;
            
            // Check if this is a tampered package
            if (shipment.IsTampered)
            {
                // Update shipment status to Delivered_Tampered for tampered packages
                shipment.Status = "Delivered_Tampered";
                shipment.StatusHistory = _tamperDetectionService.UpdateStatusHistory(shipment.StatusHistory, "Delivered_Tampered");
                shipment.DeliveredAt = DateTime.UtcNow;
                shipment.WasDeliveredWithTamper = true;
                
                await _context.SaveChangesAsync();
                
                return Ok(new { 
                    message = "OTP verified successfully. Tampered shipment marked as delivered.",
                    warning = "This shipment was delivered despite tampering concerns. Recipient will be notified."
                });
            }
            else
            {
                // Update shipment status to Delivered for normal packages
                shipment.Status = "Delivered";
                shipment.StatusHistory = _tamperDetectionService.UpdateStatusHistory(shipment.StatusHistory, "Delivered");
                shipment.DeliveredAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "OTP verified successfully. Shipment marked as delivered." });
            }
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
        public string? HandlerEmail { get; set; }
    }

    public class DeliveryConfirmation
    {
        public string? DeliveryAddress { get; set; }
        public string? Notes { get; set; }
        public string? HandlerEmail { get; set; }
        public string? Otp { get; set; }
    }

    public class TamperReportRequest
    {
        public string Reason { get; set; } = string.Empty;
        public string? HandlerEmail { get; set; }
    }
    
    public class HandlerOtpVerificationRequest
    {
        public string Otp { get; set; } = string.Empty;
        public string? HandlerEmail { get; set; }
    }
} 