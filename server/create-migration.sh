#!/bin/bash
# Script to create a new database migration

# Check if the .NET EF tools are installed
if ! dotnet ef --version >/dev/null 2>&1; then
    echo "Installing dotnet-ef tools..."
    dotnet tool install --global dotnet-ef
fi

# Check if migration name is provided
if [ -z "$1" ]; then
    echo "Usage: ./create-migration.sh MigrationName"
    exit 1
fi

# Create migration
echo "Creating migration: $1"
dotnet ef migrations add $1 --output-dir Data/Migrations

# Display success message and next steps
echo "Migration created successfully!"
echo "To apply this migration to the database, run:"
echo "dotnet ef database update"
