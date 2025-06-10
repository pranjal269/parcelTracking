using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace WebApplication1.Services
{
    public interface ISmsService
    {
        Task SendSmsAsync(string phoneNumber, string message);
    }

    public class SmsService : ISmsService
    {
        private readonly IConfiguration _configuration;

        public SmsService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendSmsAsync(string phoneNumber, string message)
        {
            try
            {
                // Ensure phone number has proper country code format for India
                if (!phoneNumber.StartsWith("+"))
                {
                    // For Indian numbers, add +91 prefix
                    phoneNumber = "+91" + phoneNumber;
                }

                Console.WriteLine($"Attempting to send SMS to (formatted): {phoneNumber}");

                var smsSettings = _configuration.GetSection("SmsSettings");
                
                TwilioClient.Init(
                    smsSettings["AccountSid"], 
                    smsSettings["AuthToken"]
                );
                
                var result = await MessageResource.CreateAsync(
                    body: message,
                    from: new Twilio.Types.PhoneNumber(smsSettings["TwilioPhoneNumber"]),
                    to: new Twilio.Types.PhoneNumber(phoneNumber)
                );
                
                Console.WriteLine($"SMS sent with status: {result.Status}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending SMS: {ex.Message}");
                throw;
            }
        }
    }
}