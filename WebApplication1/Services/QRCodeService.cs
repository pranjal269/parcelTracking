using QRCoder;
using System;
using System.IO;

namespace WebApplication1.Services
{
    public interface IQRCodeService
    {
        string GenerateQRCode(string content);
    }

    public class QRCodeService : IQRCodeService
    {
        public string GenerateQRCode(string content)
        {
            using (var qrGenerator = new QRCodeGenerator())
            {
                var qrCodeData = qrGenerator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q);

                // Use PngByteQRCode for better cross-platform support
                var qrCode = new PngByteQRCode(qrCodeData);
                byte[] qrCodeBytes = qrCode.GetGraphic(10);

                // Convert to Base64
                return Convert.ToBase64String(qrCodeBytes);
            }
        }
    }
}