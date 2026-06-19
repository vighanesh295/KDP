.PHONY: dev build generate-data

dev:
	@echo "Starting frontend and backend servers..."
	@# Run the frontend in the background and the backend in the foreground
	@cd client && npm run dev &
	@cd server && uvicorn main:app --reload

build:
	@echo "Building frontend for production..."
	@cd client && npm run build

generate-data:
	@echo "Generating synthetic data..."
	@cd server && python data/generate_data.py
