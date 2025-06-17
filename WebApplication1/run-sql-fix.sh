#!/bin/bash

# Get connection string from appsettings.json
CONNECTION_STRING=$(grep -o '"DefaultConnection": "[^"]*"' appsettings.json | cut -d'"' -f4)

# Extract PostgreSQL connection details
HOST=$(echo $CONNECTION_STRING | grep -o 'Host=[^;]*' | cut -d'=' -f2)
PORT=$(echo $CONNECTION_STRING | grep -o 'Port=[^;]*' | cut -d'=' -f2)
DATABASE=$(echo $CONNECTION_STRING | grep -o 'Database=[^;]*' | cut -d'=' -f2)
USERNAME=$(echo $CONNECTION_STRING | grep -o 'Username=[^;]*' | cut -d'=' -f2)
PASSWORD=$(echo $CONNECTION_STRING | grep -o 'Password=[^;]*' | cut -d'=' -f2)

echo "Executing SQL fix..."
export PGPASSWORD=$PASSWORD
psql -h $HOST -p $PORT -d $DATABASE -U $USERNAME -f fix-recipient-phone.sql

echo "SQL fix executed. Checking column status..."
psql -h $HOST -p $PORT -d $DATABASE -U $USERNAME -c "SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'Shipments' AND column_name = 'RecipientPhoneNumber';"

echo "Checking sample data..."
psql -h $HOST -p $PORT -d $DATABASE -U $USERNAME -c "SELECT \"Id\", \"RecipientName\", \"RecipientPhoneNumber\" FROM \"Shipments\" LIMIT 5;" 