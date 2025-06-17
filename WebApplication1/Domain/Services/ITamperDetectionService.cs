using WebApplication1.Domain.Entities;

namespace WebApplication1.Domain.Services
{
    public interface ITamperDetectionService
    {
        bool ValidateStatusTransition(string currentStatus, string newStatus, string statusHistory);
        bool IsTamperDetected(string currentStatus, string newStatus, string statusHistory);
        string GetTamperReason(string currentStatus, string newStatus, string statusHistory);
        string UpdateStatusHistory(string currentHistory, string newStatus);
        List<string> GetValidWorkflowSteps();
        bool ShouldDeliverAsTampered(bool isCurrentlyTampered, string currentStatus, string newStatus);
    }
} 