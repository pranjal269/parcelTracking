using Microsoft.EntityFrameworkCore.Migrations;

namespace WebApplication1.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V9_AddTamperDetection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add tamper detection fields to Shipments table
            migrationBuilder.AddColumn<bool>(
                name: "IsTampered",
                table: "Shipments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TamperReason",
                table: "Shipments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TamperDetectedAt",
                table: "Shipments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TamperDetectedBy",
                table: "Shipments",
                type: "text",
                nullable: true);

            // Add status history and timestamp fields
            migrationBuilder.AddColumn<string>(
                name: "StatusHistory",
                table: "Shipments",
                type: "text",
                nullable: false,
                defaultValue: "Pending");

            migrationBuilder.AddColumn<DateTime>(
                name: "PickedUpAt",
                table: "Shipments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InTransitAt",
                table: "Shipments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OutForDeliveryAt",
                table: "Shipments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeliveredAt",
                table: "Shipments",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove tamper detection fields
            migrationBuilder.DropColumn(
                name: "IsTampered",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "TamperReason",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "TamperDetectedAt",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "TamperDetectedBy",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "StatusHistory",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "PickedUpAt",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "InTransitAt",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "OutForDeliveryAt",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "DeliveredAt",
                table: "Shipments");
        }
    }
} 