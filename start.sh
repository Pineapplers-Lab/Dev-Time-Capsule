#!/usr/bin/env bash
set -e
cd backend

python3 -m pip install --no-cache-dir -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port $PORT