#!/bin/bash
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Seeding database..."
python -m scripts.seed

echo "Starting server..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
