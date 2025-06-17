using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class V12_FixRecipientPhoneNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First check if the column exists
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'Shipments' AND column_name = 'RecipientPhoneNumber'
                    ) THEN
                        ALTER TABLE ""Shipments"" ADD COLUMN ""RecipientPhoneNumber"" TEXT;
                    END IF;
                END $$;
            ");
            
            // Make sure the column is not nullable
            migrationBuilder.AlterColumn<string>(
                name: "RecipientPhoneNumber",
                table: "Shipments",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Make the column nullable again
            migrationBuilder.AlterColumn<string>(
                name: "RecipientPhoneNumber",
                table: "Shipments",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
} 