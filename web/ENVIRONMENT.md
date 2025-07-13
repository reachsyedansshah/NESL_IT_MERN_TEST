# Environment Configuration

This document describes the environment variables used in the frontend application.

## Environment Variables

### API Configuration

- `VITE_API_BASE_URL`: The base URL for API calls (default: `http://localhost:5000/api/v1`)
- `VITE_API_TIMEOUT`: Request timeout in milliseconds (default: `10000`)

### Development Configuration

- `VITE_DEV_SERVER_PORT`: Frontend development server port (default: `3000`)
- `VITE_API_SERVER_PORT`: Backend API server port (default: `5000`)

## Setup

1. Copy the `.env` file and modify as needed:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` file:
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   VITE_API_TIMEOUT=10000

   # Development Configuration
   VITE_DEV_SERVER_PORT=3000
   VITE_API_SERVER_PORT=5000
   ```

## Port Configuration

- **Frontend**: Runs on port 3000 by default
- **Backend**: Runs on port 5000 by default

This configuration prevents port conflicts between the frontend and backend servers.

## Usage

The environment variables are automatically loaded by Vite and can be accessed in the code using:

```typescript
import.meta.env.VITE_API_BASE_URL
```

## TypeScript Support

Environment variable types are defined in `src/vite-env.d.ts` to provide proper TypeScript support. 