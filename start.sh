#!/usr/bin/env bash
set -e
cd backend

# Install dependencies using python -m pip
python -m pip install --no-cache-dir -r requirements.txt

# Start FastAPI
python -m uvicorn main:app --host 0.0.0.0 --port $PORT