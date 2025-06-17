#!/bin/bash

# Get connection string from appsettings.json
CONNECTION_STRING=$(grep -o '"DefaultConnection": "[^"]*"' appsettings.json | cut -d'"' -f4)

# Extract PostgreSQL connection details
HOST=$(echo $CONNECTION_STRING | grep -o 'Host=[^;]*' | cut -d'=' -f2)
PORT=$(echo $CONNECTION_STRING | grep -o 'Port=[^;]*' | cut -d'=' -f2)
DATABASE=$(echo $CONNECTION_STRING | grep -o 'Database=[^;]*' | cut -d'=' -f2)
USERNAME=$(echo $CONNECTION_STRING | grep -o 'Username=[^;]*' | cut -d'=' -f2)
PASSWORD=$(echo $CONNECTION_STRING | grep -o 'Password=[^;]*' | cut -d'=' -f2)

echo "Checking OTP table and data..."
export PGPASSWORD=$PASSWORD
psql -h $HOST -p $PORT -d $DATABASE -U $USERNAME -f check-otps.sql 