-- Check if the Shipments table has the RecipientPhoneNumber column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Shipments'
ORDER BY ordinal_position;

-- Check a sample shipment to see if it has RecipientPhoneNumber data
SELECT "Id", "RecipientName", "RecipientPhoneNumber", "TrackingId"
FROM "Shipments"
LIMIT 5; 