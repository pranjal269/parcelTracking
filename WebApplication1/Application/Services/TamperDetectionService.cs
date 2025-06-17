using WebApplication1.Domain.Services;
using WebApplication1.Domain.Entities;

namespace WebApplication1.Application.Services
{
    public class TamperDetectionService : ITamperDetectionService
    {
        // Define the proper workflow sequence
        private readonly List<string> _workflowSteps = new()
        {
            "Pending",
            "Picked Up",
            "In Transit", 
            "Out for Delivery",
            "Delivered"
        };

        // Valid delivery statuses
        private readonly List<string> _deliveryStatuses = new()
        {
            "Delivered",
            "Delivered_Tampered"
        };

        public List<string> GetValidWorkflowSteps()
        {
            return _workflowSteps;
        }

        public bool ValidateStatusTransition(string currentStatus, string newStatus, string statusHistory)
        {
            // Allow handlers to move backwards in the workflow (in case of corrections)
            // But detect forward jumps as potential tampering
            
            var currentIndex = _workflowSteps.IndexOf(currentStatus);
            var newIndex = _workflowSteps.IndexOf(newStatus);
            
            // Special handling for tampered deliveries
            if (newStatus == "Delivered_Tampered")
            {
                // Allow delivery of tampered packages from any status
                return true;
            }
            
            // If either status is not in the workflow, it's invalid
            if (currentIndex == -1 || newIndex == -1)
            {
                return false;
            }
            
            // Allow backward transitions (corrections)
            if (newIndex <= currentIndex)
            {
                return true;
            }
            
            // For forward transitions, check if we're skipping steps
            var historySteps = statusHistory.Split(',').Select(s => s.Trim()).ToList();
            
            // Check if all intermediate steps have been completed
            for (int i = currentIndex + 1; i < newIndex; i++)
            {
                var intermediateStep = _workflowSteps[i];
                if (!historySteps.Contains(intermediateStep))
                {
                    return false; // Skipping a step - potential tamper
                }
            }
            
            return true;
        }

        public bool IsTamperDetected(string currentStatus, string newStatus, string statusHistory)
        {
            // Don't detect tamper for tampered deliveries - they're intentionally allowed
            if (newStatus == "Delivered_Tampered")
            {
                return false;
            }
            
            // Check for workflow violations
            if (!ValidateStatusTransition(currentStatus, newStatus, statusHistory))
            {
                return true;
            }
            
            // Additional tamper detection rules can be added here
            // For example: time-based checks, location-based checks, etc.
            
            return false;
        }

        public string GetTamperReason(string currentStatus, string newStatus, string statusHistory)
        {
            var currentIndex = _workflowSteps.IndexOf(currentStatus);
            var newIndex = _workflowSteps.IndexOf(newStatus);
            
            if (currentIndex == -1 || newIndex == -1)
            {
                return "Invalid status transition detected";
            }
            
            if (newIndex > currentIndex + 1)
            {
                var historySteps = statusHistory.Split(',').Select(s => s.Trim()).ToList();
                var skippedSteps = new List<string>();
                
                for (int i = currentIndex + 1; i < newIndex; i++)
                {
                    var step = _workflowSteps[i];
                    if (!historySteps.Contains(step))
                    {
                        skippedSteps.Add(step);
                    }
                }
                
                if (skippedSteps.Any())
                {
                    return $"Workflow violation: Skipped steps - {string.Join(", ", skippedSteps)}. " +
                           $"Attempted to jump from '{currentStatus}' to '{newStatus}' without proper sequence.";
                }
            }
            
            return "Workflow violation detected";
        }

        public string UpdateStatusHistory(string currentHistory, string newStatus)
        {
            var historySteps = currentHistory.Split(',').Select(s => s.Trim()).ToList();
            
            // For tampered deliveries, treat as regular delivery in history
            var statusForHistory = newStatus == "Delivered_Tampered" ? "Delivered" : newStatus;
            
            // Only add the status if it's not already in the history
            if (!historySteps.Contains(statusForHistory))
            {
                historySteps.Add(statusForHistory);
            }
            
            return string.Join(", ", historySteps);
        }

        public bool ShouldDeliverAsTampered(bool isCurrentlyTampered, string currentStatus, string newStatus)
        {
            // If package is already tampered and being delivered, it should be marked as tampered delivery
            return isCurrentlyTampered && (newStatus == "Delivered" || newStatus == "Delivered_Tampered");
        }
    }
} 