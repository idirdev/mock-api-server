# Mock API Server

Configurable API mocking server built with Express and TypeScript. Generate fake REST endpoints with realistic data, configurable delays, and colorful request logging.

## Features

- Dynamic route registration from config
- Fake data generators (users, posts, products)
- Pagination support on all list endpoints
- Configurable response delays with jitter
- Colorful request logging
- Route listing endpoint (`/api/_routes`)
- CORS enabled by default

## Getting Started

```bash
npm install
npm run dev
```

Server starts at `http://localhost:3456`.

## Endpoints

| Method | Path               | Description                    |
|--------|--------------------|--------------------------------|
| GET    | /api/users         | Paginated users list           |
| GET    | /api/users/:id     | Get user by ID                 |
| POST   | /api/users         | Create user (500ms delay)      |
| DELETE | /api/users/:id     | Delete user                    |
| GET    | /api/posts         | Paginated posts (filter by tag)|
| GET    | /api/posts/:id     | Get post by ID                 |
| POST   | /api/posts         | Create post                    |
| GET    | /api/products      | Paginated products             |
| GET    | /api/products/:id  | Get product by ID              |
| POST   | /api/products      | Create product                 |
| GET    | /api/health        | Health check                   |
| GET    | /api/_routes       | List all routes                |

## Tech Stack

- Express 4
- TypeScript
- Custom fake data generators (no external faker dependency)
