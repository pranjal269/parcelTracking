using System;

namespace WebApplication1.Services
{
    public interface ITrackingService
    {
        string GenerateTrackingId();
        string GenerateOtp();
    }

    public class TrackingService : ITrackingService
    {
        public string GenerateTrackingId()
        {
            // Format: PT-YYMM-XXXXXX (PT = Parcel Tracking, YY = Year, MM = Month, X = Random alphanumeric)
            var random = new Random();
            var year = DateTime.Now.ToString("yy");
            var month = DateTime.Now.ToString("MM");
            
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var randomPart = new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());            
            return $"PT-{year}{month}-{randomPart}";
        }

        public string GenerateOtp()
        {
            // Generate a 6-digit OTP
            var random = new Random();
            return random.Next(100000, 1000000).ToString();
        }
    }
}