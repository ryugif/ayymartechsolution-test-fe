# Frontend

Frontend application for the CMF Design Assistant, built with React, TypeScript, and Vite.

## Tech Stack

- React 19
- TypeScript
- TanStack Router
- TanStack Query
- Zustand
- Tailwind CSS v4
- shadcn/ui
- Vite
- Docker and Nginx

## Prerequisites

For local development:

- Node.js 24+
- pnpm
- A running backend API

For Docker deployment:

- Docker Engine or Docker Desktop
- Docker Compose

## Getting Started

### 1. Install dependencies

Clone the repository and navigate to the frontend directory.

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example environment file to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |

The API URL should include `/api` if the backend uses the `/api` global prefix.

**Note:** Vite exposes variables prefixed with `VITE_` to client-side code. Do not store secrets in these variables.

### 3. Start development server

```bash
pnpm dev
```

Open the application at:

http://localhost:5173

The development server supports hot module replacement (HMR).

### 4. Build for production

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## Running with Docker

The production Docker setup uses a multi-stage build:

1. Installs dependencies using pnpm.
2. Builds the frontend using Vite.
3. Serves the generated static files using Nginx.

### 1. Configure environment variables

Copy the example environment file to `.env`:

```bash
cp .env.example .env
```

### 2. Build and start the container

```bash
docker compose up -d --build
```

### 3. Access the application

Open:

http://localhost:8080

The frontend container serves the application on port `80`, mapped to port `8080` on the host.

### Docker commands

Start the application:

```bash
docker compose up -d
```

Rebuild after code or configuration changes:

```bash
docker compose up -d --build
```

View logs:

```bash
docker compose logs -f frontend
```

Check running containers:

```bash
docker compose ps
```

Stop the application:

```bash
docker compose down
```

## API Configuration

The frontend sends requests using the configured API base URL.

Example:

```typescript
const API_URL = import.meta.env.VITE_API_URL ?? '/api';

fetch(`${API_URL}/auth/me`, {
  credentials: 'include',
});
```

With the default configuration, requests are sent to:

```text
http://localhost:3000/api/auth/me
```

### Backend requirements

Ensure the NestJS backend:

- Is running and accessible on port `3000`.
- Uses the expected `/api` route prefix.
- Allows the frontend origin through CORS.
- Enables credentialed requests if cookie-based authentication is used.

For local development, allow these frontend origins as needed:

```text
http://localhost:5173
http://localhost:8080
```

The backend must return the appropriate CORS headers, including `Access-Control-Allow-Credentials: true` for