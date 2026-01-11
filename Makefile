# Variables
DOCKER_USERNAME=softvence
PACKAGE_NAME=nestjs_starter
PACKAGE_VERSION=latest

# Docker image name
APP_IMAGE := $(DOCKER_USERNAME)/$(PACKAGE_NAME):$(PACKAGE_VERSION)

# Files
COMPOSE_FILE := compose.yaml
DOCKERFILE := Dockerfile

.PHONY: help build up start stop restart logs logs-api clean push ps local-up local-down local images volumes networks

help:
	@echo "Available commands:"
	@echo ""
	@echo "Production Commands (Default):"
	@echo "  make build             Build the Docker image"
	@echo "  make up                Start containers (attached)"
	@echo "  make start             Start containers (detached)"
	@echo "  make stop              Stop containers"
	@echo "  make restart           Restart containers"
	@echo "  make logs              Show logs"
	@echo "  make logs-api          Show API logs"
	@echo "  make clean             Remove containers, networks, volumes"
	@echo "  make push              Push image to Docker Hub"
	@echo "  make ps                List production containers"
	@echo ""
	@echo "Local Development Commands (local-* - Hybrid):"
	@echo "  make local-up          Start dependencies (DB, Redis) only"
	@echo "  make local-down        Stop dependencies"
	@echo "  make local             Start deps and run 'pnpm dev' locally"
	@echo ""
	@echo "General / Inspection:"
	@echo "  make images            List images"
	@echo "  make volumes           List volumes"
	@echo "  make networks          List networks"
	@echo ""

# ==========================================
# Production Commands (Default)
# ==========================================

build:
	docker build -t $(APP_IMAGE) .

up:
	docker compose -f $(COMPOSE_FILE) --profile prod up --remove-orphans

start:
	docker compose -f $(COMPOSE_FILE) --profile prod up -d

stop:
	docker compose -f $(COMPOSE_FILE) --profile prod down

restart:
	docker compose -f $(COMPOSE_FILE) --profile prod restart
	docker compose -f $(COMPOSE_FILE) --profile prod up -d

logs:
	docker compose -f $(COMPOSE_FILE) --profile prod logs -f

logs-api:
	docker compose -f $(COMPOSE_FILE) --profile prod logs -f api

clean:
	docker compose -f $(COMPOSE_FILE) --profile prod down --volumes --remove-orphans
	docker rmi $(APP_IMAGE) || true

push:
	docker push $(APP_IMAGE)

ps:
	docker compose -f $(COMPOSE_FILE) --profile prod ps -a

# ==========================================
# Local Development Commands (Hybrid)
# ==========================================

local-up:
	docker compose -f $(COMPOSE_FILE) --profile dev up -d

local-down:
	docker compose -f $(COMPOSE_FILE) --profile dev down

local:
	@echo "Starting development services..."
	@$(MAKE) local-up
	@echo "Waiting for services to be ready..."
	@sleep 3
	@echo "Installing dependencies..."
	pnpm install
	@echo "Database migrations..."
	npx prisma migrate deploy
	@echo "Starting application in development mode..."
	pnpm dev

# ==========================================
# General / Inspection
# ==========================================

images:
	docker images

volumes:
	docker volume ls

networks:
	docker network ls
