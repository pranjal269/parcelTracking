-- Check if the column exists, if not, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Shipments' AND column_name = 'RecipientPhoneNumber'
    ) THEN
        ALTER TABLE "Shipments" ADD COLUMN "RecipientPhoneNumber" TEXT;
        RAISE NOTICE 'Column RecipientPhoneNumber added to Shipments table';
    ELSE
        RAISE NOTICE 'Column RecipientPhoneNumber already exists in Shipments table';
    END IF;
END $$; 