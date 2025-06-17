using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V11_RemoveUserOtpGeneration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Clear all existing OTPs as we're changing the workflow
            migrationBuilder.Sql("DELETE FROM \"DeliveryOtps\"");
            
            // Add a database constraint to add validation
            migrationBuilder.Sql("ALTER TABLE \"DeliveryOtps\" ADD CONSTRAINT \"CK_DeliveryOtps_Otp_Length\" CHECK (length(\"Otp\") = 6)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove the constraint
            migrationBuilder.Sql("ALTER TABLE \"DeliveryOtps\" DROP CONSTRAINT IF EXISTS \"CK_DeliveryOtps_Otp_Length\"");
        }
    }
} 