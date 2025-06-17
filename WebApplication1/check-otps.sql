-- Check if the DeliveryOtps table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'DeliveryOtps'
) AS "DeliveryOtps_Table_Exists";

-- Check the structure of the DeliveryOtps table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'DeliveryOtps';

-- Count the number of OTPs in the table
SELECT COUNT(*) AS "Total_OTPs" FROM "DeliveryOtps";

-- Show the most recent OTPs
SELECT * FROM "DeliveryOtps" ORDER BY "Id" DESC LIMIT 10; 