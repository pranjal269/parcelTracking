#!/bin/bash

# Build the application
echo "Building the application..."
dotnet build

# Apply migrations
echo "Applying migrations..."
dotnet ef database update

# Run the application
echo "Starting the application..."
dotnet run --launch-profile "https" 