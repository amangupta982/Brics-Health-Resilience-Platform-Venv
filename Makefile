.PHONY: dev backend frontend start

dev:
	@./start.sh

start:
	@./start.sh

backend:
	cd backend && PYTHONPATH=. ../venv/bin/python -m uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev
