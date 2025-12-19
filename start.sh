#!/usr/bin/env bash
#!/usr/bin/env bash
set -e  # Exit on any error

cd backend || exit 1  # Fail if backend folder doesn't exist

# Upgrade pip to avoid install issues
python3 -m pip install --upgrade pip

# Install dependencies explicitly
python3 -m pip install --no-cache-dir -r requirements.txt

# Start the server
python3 -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8080}"
