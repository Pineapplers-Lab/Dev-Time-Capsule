# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend code
COPY backend/ ./backend/

# Upgrade pip and install dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r backend/requirements.txt

# Expose the port (Railway uses PORT environment variable)
EXPOSE 8080

# Start FastAPI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
