# PhotoGlow

_Let your moments glow in the cloud_

**[>> Design Documentation](./photoglow.pdf)**

**Live Demo: [https://photoglow.xyz](https://photoglow.xyz)**


## Introduction

PhotoGlow is a modern cloud-based photo storage and sharing platform. This project uses a monorepo architecture, which means all related code is managed in a single repository but organized into separate packages for better maintainability and scalability.

## Project Structure

The project is organized into several specialized packages:

- **[web](./web/README.md)**: The frontend application built with latest Next.js 15 + React 19 + TailwindCSS v4, providing the user interface
- **[server](./server/README.md)**: The backend API service built with Nest.js 11 + Prisma ORM, handling business logic and data processing
- **[shared](./shared/README.md)**: Common code, types, environment configurations, and constants used across packages
- **[sdk](./sdk/README.md)**: Auto-generated API library that provides type-safe API access for different programming languages
- **[database](./database/README.md)**: Database schema and client using Prisma ORM
- **[nginx](./nginx/README.md)**: Web server configuration for production deployment
- **[admin](./admin/README.md)**: The admin dashboard, API and database. This is a standalone service, and excluded from production docker image.

For detailed documentation on each package, please read the README in the corresponding directory.

<img src="./images/photoglow-monorepo.svg" alt="monorepos" width="500"/>

## Prerequisites

Before you begin, ensure you have the following software installed on your system:

- **[Bun](https://bun.sh)**
- **PostgreSQL**: Version 16 or higher
- **Redis**: In-memory data store
- **Docker**: For production deployment

## Development Setup

### 1. Installing Core Dependencies

#### Installing Bun

Bun is our primary JavaScript runtime and package manager. It offers significantly faster performance compared to Node.js and npm.

For Windows users:

```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

For Linux and macOS users:

```bash
curl -fsSL https://bun.sh/install | bash
```

#### Installing PostgreSQL

1. Download PostgreSQL 16 or higher from the [official website](https://www.postgresql.org/download/)
2. Follow the installation instructions for your operating system
3. Make note of your database username, password, and port number - you'll need these later

#### Installing Redis

Redis is used for caching and session management.

- For Linux and macOS: Follow the [official Redis installation guide](https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/)
- For Windows: Use the [Redis for Windows](https://github.com/redis-windows/redis-windows/) distribution

### 2. Project Setup

First, install all project dependencies:

```bash
bun install
```

### 3. Environment Configuration

The project requires various environment variables to function properly. We'll create and configure them step by step.

1. Create your environment file:

```bash
cp .env.example .env
```

2. Configure the following essential variables in your `.env` file:

#### Database Configuration

```env
DATABASE_URL="postgresql://username:password@localhost:5432/photoglow?schema=public"
```

Replace `username`, `password` with your PostgreSQL credentials.

#### URL Configurations

```env
# URL for the frontend application
FRONTEND_URL=http://localhost:8080

# Internal API URL used for server-side rendering
INTERNAL_API_URL=http://localhost:8001

# Public API URL for client-side requests
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Understanding `INTERNAL_API_URL` and Hybrid Rendering:

The `INTERNAL_API_URL` setting is particularly important because our Next.js frontend application uses hybrid rendering. Let's break down what this means:

When a user visits our website, the page rendering happens in two stages:

1. Server-side rendering (SSR): First, the Next.js server generates the initial HTML on the server before sending it to the user's browser. During this phase, any API calls need to use `INTERNAL_API_URL` to communicate with our backend server.
2. Client-side rendering: After the initial page load, the JavaScript in the user's browser takes over and handles subsequent updates. These client-side API calls use `NEXT_PUBLIC_API_URL`.

Why do we need two different URLs?

- `INTERNAL_API_URL` is used within our internal network (either on your local machine during development or between Docker containers in production). It doesn't need HTTPS and should be configured for optimal internal network performance.
- `NEXT_PUBLIC_API_URL` is used by the user's browser, so it needs to be publicly accessible and should use HTTPS in production.

For example:

- In development:
  - `INTERNAL_API_URL=http://localhost:8001` (local machine access)
  - `NEXT_PUBLIC_API_URL=http://localhost:8080` (browser access)
- In production with Docker:
  - `INTERNAL_API_URL=http://server:8001` (Docker container name)
  - `NEXT_PUBLIC_API_URL=https://your.domain` (public domain)

#### Security Configuration

```env
# Secret key for JWT token encryption
JWT_SECRET=your_very_long_random_secret_key
```

For production, use a strong random string of at least 32 characters.

#### Additional Services

Your `.env` file should also include configurations for:

- Redis connection details
- AWS S3 credentials for photo storage
- AWS SES settings for email functionality
- Google OAuth credentials for social login

### 4. Database Setup

Navigate to the database package:

```bash
cd database
```

Initialize your database with these commands:

```bash
# Create database tables and relationships
bun run migrate

# Generate the Prisma client
bun run generate
```

Additional database management commands:

```bash
# Reset the database (warning: this deletes all data)
bun run reset

# Update database schema
bun run push

# Generate schema from existing database
bun run pull
```

### 5. Running the Server

Navigate to the server package:

```bash
cd server
```

For development:

```bash
# Start with auto-reload on code changes
bun run start:dev

# Start without auto-reload
bun run start
```

Additional server commands:

```bash
# Build for production
bun run build

# Start in production mode
bun run start:prod

# Generate API documentation
bun run generate-swagger

# Set up email templates
bun run create-mail-template
```

### 6. Running the Frontend

Navigate to the web package:

```bash
cd web
```

Development commands:

```bash
# Start development server with Turbopack
bun run dev

# Start in legacy mode (slower but with better error messages)
bun run dev:legacy

# Check TypeScript types
bun run type-check
```

Production commands:

```bash
# Build for production
bun run build

# Start production server
bun run start
```

**Important**: When using Bun for development, type checking is not automatic. Run `bun run type-check` regularly to catch type errors.

## Production Deployment

### 1. Docker Setup

Install Docker and Docker Compose:

- Download and install [Docker](https://www.docker.com)
- For Debian/Ubuntu: `apt-get install docker-compose-v2`

### 2. Production Environment Configuration

Update your `.env` file with production values:

```env
# Use your actual domain
FRONTEND_URL=https://your.domain
NEXT_PUBLIC_API_URL=https://your.domain
GOOGLE_OAUTH_REDIRECT_URI=https://your.domain/api/v1/auth/google/callback

# Docker service names for internal communication
INTERNAL_API_URL=http://server:8001
DATABASE_URL="postgresql://user:password@postgres:5432/photoglow?schema=public"
```

### 3. Launching Services

Start all services using Docker Compose:

```bash
# For Docker Compose V2
docker compose up -d

# For older Docker Compose
docker-compose up -d

# View running containers
docker ps -a
```

The deployment includes these services:

- PostgreSQL database
- Redis cache
- Backend server
- Frontend web application
- Nginx reverse proxy

Only Nginx exposes ports 80 (HTTP) and 443 (HTTPS) to the internet.

#### Managing Services

```bash
# Rebuild a specific service
docker compose up -d <service> --build

# Rebuild all services
docker compose up -d --build
```

Note: PostgreSQL data persists between rebuilds unless manually deleted.

## Internal packages

- [@photoglow/web Documentation](./web/README.md)
- [@photoglow/server Documentation](./server/README.md)
- [@photoglow/shared Documentation](./shared/README.md)
- [@photoglow/sdk Documentation](./sdk/README.md)
- [@photoglow/database Documentation](./database/README.md)
- [@photoglow/nginx Documentation](./nginx/README.md)
- [@photoglow/admin Documentation](./admin/README.md)


## Additional Resources

- [Bun Documentation](https://bun.sh)
- [Docker Compose Documentation](https://docs.docker.com/reference/cli/docker/compose/)
- [Docker CLI Documentation](https://docs.docker.com/reference/cli/docker/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Nest.js Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)


### API Endpoints Overview

#### Authentication Endpoints
```
POST   /api/v1/auth/register           # User registration
POST   /api/v1/auth/login              # User login
POST   /api/v1/auth/refresh            # Token refresh
POST   /api/v1/auth/logout             # User logout
GET    /api/v1/auth/google             # Google OAuth initiation
GET    /api/v1/auth/google/callback    # OAuth callback
POST   /api/v1/auth/verify-email       # Email verification
POST   /api/v1/auth/forgot-password    # Password reset request
POST   /api/v1/auth/reset-password     # Password reset confirmation
```

#### Posts Management
```
GET    /api/v1/posts                   # Get posts feed
POST   /api/v1/posts                   # Create new post
GET    /api/v1/posts/:id               # Get specific post
PUT    /api/v1/posts/:id               # Update post
DELETE /api/v1/posts/:id               # Delete post
GET    /api/v1/posts/:id/comments      # Get post comments
POST   /api/v1/posts/:id/comments      # Add comment
```

#### User Management
```
GET    /api/v1/user/profile            # Get user profile
PUT    /api/v1/user/profile            # Update profile
POST   /api/v1/user/avatar             # Upload avatar
GET    /api/v1/user/:username          # Get user by username
GET    /api/v1/user/:id/posts          # Get user's posts
GET    /api/v1/user/:id/followers      # Get followers
GET    /api/v1/user/:id/following      # Get following
```

#### Interactions
```
POST   /api/v1/posts/:id/like          # Like/unlike post
POST   /api/v1/posts/:id/save          # Save/unsave post
POST   /api/v1/comments/:id/like       # Like/unlike comment
POST   /api/v1/users/:id/follow        # Follow/unfollow user
POST   /api/v1/users/:id/block         # Block/unblock user
```

#### Real-time Communication
```
GET    /api/v1/chat/conversations      # Get user conversations
POST   /api/v1/chat/conversations      # Create conversation
GET    /api/v1/chat/conversations/:id/messages  # Get messages
POST   /api/v1/chat/conversations/:id/messages  # Send message
PUT    /api/v1/chat/messages/read      # Mark messages as read
```

#### Media Management
```
POST   /api/v1/media/upload            # Upload media file
GET    /api/v1/media/drafts            # Get user's drafts
DELETE /api/v1/media/:id               # Delete media file
```

#### Search & Discovery
```
GET    /api/v1/search                  # Global search
GET    /api/v1/topics                  # Get popular topics
GET    /api/v1/topics/:id              # Get topic details
GET    /api/v1/topics/:id/posts        # Get topic posts
GET    /api/v1/mentions/users          # Search users for mentions
GET    /api/v1/mentions/topics         # Search topics for mentions
```

#### Notifications
```
GET    /api/v1/notifications           # Get user notifications
PUT    /api/v1/notifications/read      # Mark notifications as read
GET    /api/v1/notifications/count     # Get unread counts
```
