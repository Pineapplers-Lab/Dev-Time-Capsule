#!/usr/bin/env bash
set -e
cd backend

pip install --no-cache-dir -r requirements.txt

# Start the FastAPI app with uvicorn
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
