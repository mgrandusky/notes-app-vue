# Docker Setup for Notes App (Vue.js)

This guide explains how to run the Notes App Vue.js version using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Project Structure

```
notes-app-vue/
├── backend/          # Node.js/Express backend
│   └── Dockerfile
├── frontend/         # Vue.js frontend
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── .env
```

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mgrandusky/notes-app-vue.git
   cd notes-app-vue
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start the containers**:
   ```bash
   docker-compose up -d --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:4000

## Docker Commands

### Start the application
```bash
docker-compose up -d
```

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Rebuild containers
```bash
docker-compose up -d --build
```

### Run backend commands
```bash
# Access backend shell
docker-compose exec backend sh

# Run database migrations (if applicable)
docker-compose exec backend npm run migrate
```

## Development Mode

For development with hot reloading:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Create `docker-compose.dev.yml`:
```yaml
version: '3.8'

services:
  backend:
    command: npm run dev
    environment:
      NODE_ENV: development
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ./frontend
      target: build
    command: npm run dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
```

## Environment Variables

Key variables in `.env`:

- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `VITE_API_URL` - Backend API URL for frontend

## Production Deployment

For production:

1. **Set strong secrets** in `.env`
2. **Use environment-specific URLs**
3. **Set up SSL/HTTPS** with reverse proxy
4. **Use managed database** (optional)
5. **Configure CORS** properly

Example nginx reverse proxy config:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
    }

    location /api {
        proxy_pass http://localhost:4000;
    }
}
```

## Troubleshooting

### Database connection errors
```bash
docker-compose down -v
docker-compose up -d
```

### Port conflicts
Change ports in `docker-compose.yml` if 4000 or 8080 are in use.

### Frontend not connecting to backend
Check `VITE_API_URL` in frontend environment and CORS settings in backend.

## Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U user notesapp_vue &gt; backup.sql

# Restore
docker-compose exec -T postgres psql -U user notesapp_vue &lt; backup.sql
```

## Cleanup

Remove all containers and volumes:
```bash
docker-compose down -v
```
