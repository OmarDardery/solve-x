# Docker Guide for SolveX Monorepo

This guide covers how to build and run the SolveX application using Docker and Docker Compose.

## Prerequisites

- Docker installed (v20.10+)
- Docker Compose installed (v2.0+)

## Project Structure

```
solvex-monorepo/
├── backend/
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development build
│   └── ...
├── frontend/
│   ├── Dockerfile              # Production build
│   └── ...
├── docker-compose.yml          # Production configuration
└── docker-compose.dev.yml      # Development configuration
```

---

## Development Environment

### Start Development Environment

The development environment includes:
- PostgreSQL database (port 5432)
- Backend with hot reload (port 8000)
- Frontend with Vite dev server (port 3000)

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Start in detached mode (background)
docker-compose -f docker-compose.dev.yml up -d

# Build and start
docker-compose -f docker-compose.dev.yml up --build
```

### Stop Development Environment

```bash
# Stop services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose -f docker-compose.dev.yml down -v
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f db
```

### Restart a Service

```bash
docker-compose -f docker-compose.dev.yml restart backend
docker-compose -f docker-compose.dev.yml restart frontend
```

### Access Services (Development)

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Database: localhost:5432
  - User: `postgres`
  - Password: `postgres`
  - Database: `solvex_dev`

### Development Database Access

Connect to the database:
```bash
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d solvex_dev
```

---

## Production Environment

### Build Production Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Start Production Environment

The production environment includes:
- Backend (port 8000) - connects to external Prisma database
- Frontend with Nginx (port 3000)

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Build and start
docker-compose up --build -d
```

### Stop Production Environment

```bash
# Stop services
docker-compose down

# Stop and remove all resources
docker-compose down --volumes --remove-orphans
```

### View Production Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Services (Production)

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

---

## Common Docker Commands

### Container Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop a container
docker stop <container-name>

# Remove a container
docker rm <container-name>

# Execute command in container
docker exec -it <container-name> sh
```

### Image Management

```bash
# List images
docker images

# Remove an image
docker rmi <image-name>

# Remove unused images
docker image prune

# Remove all unused images
docker image prune -a
```

### Volume Management

```bash
# List volumes
docker volume ls

# Remove a volume
docker volume rm <volume-name>

# Remove all unused volumes
docker volume prune
```

### System Cleanup

```bash
# Remove all stopped containers, unused networks, dangling images
docker system prune

# Remove everything including unused images and volumes
docker system prune -a --volumes
```

---

## Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Find process using port
lsof -i :3000  # or :8000, :5432

# Kill the process
kill -9 <PID>
```

Or change the port in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3001 to available port
```

### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database Connection Issues (Dev)

```bash
# Restart database
docker-compose -f docker-compose.dev.yml restart db

# Check database logs
docker-compose -f docker-compose.dev.yml logs db

# Verify database is healthy
docker-compose -f docker-compose.dev.yml ps
```

### Reset Development Database

```bash
# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Start fresh
docker-compose -f docker-compose.dev.yml up
```

### Frontend Not Loading

```bash
# Rebuild frontend
docker-compose -f docker-compose.dev.yml build --no-cache frontend
docker-compose -f docker-compose.dev.yml up frontend

# Check node_modules
docker-compose -f docker-compose.dev.yml exec frontend npm install
```

### Backend Build Fails

```bash
# Clean Go cache
docker-compose -f docker-compose.dev.yml exec backend go clean -modcache

# Rebuild
docker-compose -f docker-compose.dev.yml build --no-cache backend
```

---

## Environment Variables

### Development

Create `.env` file in backend directory with:
```env
PORT=8000
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=solvex_dev
```

### Production

Ensure backend `.env` has production database credentials (Prisma connection).

---

## Best Practices

1. **Always use specific compose files**:
   - Development: `docker-compose -f docker-compose.dev.yml`
   - Production: `docker-compose`

2. **Rebuild after dependency changes**:
   ```bash
   docker-compose build --no-cache
   ```

3. **Clean up regularly**:
   ```bash
   docker system prune
   ```

4. **View logs when debugging**:
   ```bash
   docker-compose logs -f
   ```

5. **Use health checks** to ensure services are ready before dependent services start

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dev | `docker-compose -f docker-compose.dev.yml up` |
| Start prod | `docker-compose up` |
| Stop dev | `docker-compose -f docker-compose.dev.yml down` |
| Stop prod | `docker-compose down` |
| Rebuild dev | `docker-compose -f docker-compose.dev.yml up --build` |
| Rebuild prod | `docker-compose up --build` |
| View logs | `docker-compose logs -f <service>` |
| Shell into container | `docker exec -it <container> sh` |
| Clean everything | `docker system prune -a --volumes` |
