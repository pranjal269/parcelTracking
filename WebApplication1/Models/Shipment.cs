using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class Shipment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string RecipientName { get; set; } = string.Empty;

        [Required]
        public string DeliveryAddress { get; set; } = string.Empty;

        // New field to track current location
        public string CurrentAddress { get; set; } = string.Empty;

        public string PackageType { get; set; } = string.Empty;

        [Range(0.01, 1000)]
        public decimal Weight { get; set; }

        public string SpecialInstructions { get; set; } = string.Empty;

        public string Photo { get; set; } = string.Empty;

        [Required]
        public int UserId { get; set; }

        public string UserEmail { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Pending";

        public string TrackingId { get; set; } = string.Empty;

        // QR Code as string (Base64 encoded image)
        public string? QRCodeImage { get; set; }
    }
}