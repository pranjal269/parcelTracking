-- First ensure the column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Shipments' AND column_name = 'RecipientPhoneNumber'
    ) THEN
        ALTER TABLE "Shipments" ADD COLUMN "RecipientPhoneNumber" TEXT;
    END IF;
END $$;

-- Update any existing records with null or empty RecipientPhoneNumber
UPDATE "Shipments"
SET "RecipientPhoneNumber" = '0000000000'
WHERE "RecipientPhoneNumber" IS NULL OR "RecipientPhoneNumber" = '';

-- Add a NOT NULL constraint to the column
ALTER TABLE "Shipments" ALTER COLUMN "RecipientPhoneNumber" SET NOT NULL; 