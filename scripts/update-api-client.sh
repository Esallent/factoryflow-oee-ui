#!/bin/bash

echo "🔄 Updating API Client SDK from FactoryOS backend..."

# Download the TypeScript SDK from the backend
curl -s https://factory-os-backend.replit.app/integration/export?format=ts > src/lib/apiClient.ts

# Check if the download was successful
if [ $? -eq 0 ]; then
  echo "✅ API Client SDK updated successfully"
  
  # Verify the file is not empty
  if [ -s src/lib/apiClient.ts ]; then
    echo "✅ SDK file validated (non-empty)"
  else
    echo "❌ SDK file is empty, download may have failed"
    exit 1
  fi
else
  echo "❌ Failed to download API Client SDK"
  exit 1
fi

# Optional: Display SDK version info if available
if grep -q "version" src/lib/apiClient.ts; then
  echo "📦 SDK Version: $(grep -m 1 "version" src/lib/apiClient.ts)"
fi

echo "🎯 SDK ready for use in src/lib/apiClient.ts"
