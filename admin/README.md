# @photoglow/admin

## Overview

The `@photoglow/admin` package provides PhotoGlow's administrative dashboard. Similar to `@photoglow/web` in technology stack, but it differs in its rendering strategy - utilizing full server-side rendering for enhanced security and simplified state management. All administrative APIs are directly provided by this project, eliminating the need for separate API services.

_Note: This is a standalone service, and excluded from production docker image._

## Technology Stack

Built with the same modern technology foundation as `@photoglow/web`:

- **Next.js 15** : Leveraging server-side rendering and API routes
- **React 19** : Server components for enhanced security
- **TailwindCSS v4**: Styling system
- **Prisma**: Direct database access for administrative operations
- **shadcn/ui**: Admin interface components

## Features

The admin dashboard provides comprehensive tools for platform management:

- **Admin Authentication**

  - Role-based access control
  - Secure session management
  - Two-factor authentication support
  - Audit logging

- **User Management**

  - User account administration
  - Role and permission management
  - User activity monitoring
  - Account verification tools

- **Content Moderation**

  - Post review and moderation
  - Comment management
  - Content filtering rules
  - Automated content analysis
  - Report handling

- **Analytics Dashboard**
  - Real-time platform metrics
  - User engagement statistics
  - Content performance analysis
  - System health monitoring
  - Custom report generation

## Development Environment

Before starting development, ensure your environment variables are properly configured in the `.env` file:

```env
# Database Configuration
ADMIN_DATABASE_URL="postgresql://username:password@localhost:5432/admin_db"

# Application URLs
ADMIN_FRONTEND_URL=http://localhost:8082
INTERNAL_API_URL=http://localhost:8001
NEXT_PUBLIC_API_URL=http://localhost:8082

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

**Note: The Prisma Client and database for this service are independent and need to be run separately `bun run migrate && bun run generate`**

## Available Commands

The following commands are available for development and deployment:

```bash
# Start development server with hot reload
bun run dev

# Start in legacy mode for detailed error messages
bun run dev:legacy

# Run type checking
bun run type-check

# Build for production
bun run build

# Start production server
bun run start

# Database operations
bun run db:migrate      # Run database migrations
bun run db:generate     # Generate Prisma client
bun run db:seed        # Seed database with initial data

# Admin user management
bun run create-admin <email> <name> <password> <role>
```

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Set up your environment variables as specified in the Development Environment section.

3. Initialize the admin database:

```bash
bun run db:migrate && bun run db:generate
```

4. Create your first admin user:

```bash
bun create-admin your_email@example.com "Your Name" your_password SUPER_ADMIN
```

5. Start the development server:

```bash
bun run dev
```

## Security Considerations

The admin dashboard implements several security measures:

- Role-based access control (RBAC)
- Session management and timeout
- API request rate limiting
- Input validation and sanitization
- Audit logging for all administrative actions
- IP whitelisting capabilities
- Secure password policies

### Docker deployment

**Install docker buildx command**

```
sudo apt install docker-buildx
```

Go to the project root directory (make sure you have `Dockerfile.admin` in your directory)

**Build docker image**

```
docker buildx build -t photoglow-admin -f Dockerfile.admin .
```

**Get your network id**

```
sudo docker network ls
```

Example:

```sh
NETWORK ID     NAME               DRIVER    SCOPE
xxxxxx        photoglow-network   bridge    local
```

**Start**

```
sudo docker run -d --network <connect to docker network name> -p 8081:8081 photoglow-admin
```

## License Information

All dependencies utilized in this project are distributed under permissive open-source licenses, including but not limited to MIT, Apache 2.0, and BSD licenses. These licenses grant generous rights for the use, modification, and redistribution of the software while maintaining minimal restrictions.
