# @photoglow/server

## Overview

The `@photoglow/server` package provides PhotoGlow's backend API service using NestJS. It handles authentication, media management, real-time features, and email services. The package works in conjunction with `@photoglow/database` for data persistence through Prisma ORM.

## Technology Stack

Our backend service leverages modern technologies:

- **NestJS 11** (Jan 2025): Modern Node.js framework with enhanced decorators and dependency injection
- **Prism ORM**: A modern database toolkit that provides type-safe database access with auto-generated query builder and schema migrations.
- **Redis**: In-memory data store for caching
- **AWS SDK**: Cloud service integration for storage and email

## Key Features

The server implements core PhotoGlow functionalities:

The server provides secure authentication with JWT and OAuth 2.0, comprehensive media management through AWS S3, real-time features using WebSocket, and email services via AWS SES. It uses Redis for caching and real-time data, while database operations are handled through the `@photoglow/database` package.

## Development Environment

Required services:

- PostgreSQL 16+
- Redis
- AWS credentials for S3 and SES
- Environment variables in `.env` file

## Available Commands

Development Commands:

```bash
# Start development server with hot reload
bun run start:dev

# Start development server without hot reload
bun run start
```

Production Commands:

```bash
# Build the application
bun run build

# Start production server
bun run start:prod
```

Utility Commands:

```bash
# Generate Swagger API documentation
bun run generate-swagger

# Configure email templates in AWS SES
bun run create-mail-template
```

Testing:

```bash
# Run unit tests
bun run test

# Run end-to-end tests
bun run test:e2e

# Generate test coverage report
bun run test:cov
```

## Project Structure

```
server/
├── src/                           # Source code directory
│   ├── bootstrap.ts              # Application bootstrap configuration
│   ├── generateSwagger.ts        # Swagger documentation generator
│   ├── main.ts                  # Application entry point
│   ├── schema.gql               # GraphQL schema definition
│   │
│   ├── app/                     # Core application setup
│   │   ├── app.controller.ts    # Main application controller
│   │   ├── app.module.ts        # Root application module
│   │   ├── app.resolver.ts      # GraphQL resolver
│   │   └── app.service.ts       # Core application service
│   │
│   ├── common/                  # Shared utilities and helpers
│   │   ├── config/             # Configuration settings
│   │   │   └── multer.config.ts
│   │   ├── decorators/         # Custom decorators
│   │   │   ├── current-user.decorator.ts
│   │   │   └── username.decorator.ts
│   │   ├── guards/             # Authentication guards
│   │   │   └── jwt-auth.guard.ts
│   │   └── utils/              # Utility functions
│   │       ├── common.ts
│   │       └── token.ts
│   │
│   ├── infra/                  # Infrastructure services
│   │   ├── cookie/            # Cookie management
│   │   ├── email/             # Email service integration
│   │   ├── global/            # Global module configuration
│   │   ├── oauth/             # OAuth authentication
│   │   ├── prisma/            # Database ORM setup
│   │   ├── redis/             # Redis cache service
│   │   ├── s3/                # AWS S3 storage service
│   │   ├── tags/              # Tag management service
│   │   ├── token/             # Token management
│   │   └── verification/      # User verification service
│   │
│   └── modules/               # Feature modules
│       ├── auth/              # Authentication
│       │   ├── dto/
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   └── auth.service.ts
│       ├── chat/              # Real-time chat
│       │   ├── dto/
│       │   ├── chat.controller.ts
│       │   ├── chat.gateway.ts
│       │   ├── chat.module.ts
│       │   └── chat.service.ts
│       ├── comments/          # Comment management
│       ├── interactions/      # User interactions
│       ├── media/            # Media handling
│       │   ├── media-cleanup.service.ts
│       │   ├── media.controller.ts
│       │   ├── media.module.ts
│       │   └── media.service.ts
│       ├── mentions/         # @mentions system
│       ├── moderation/       # Content moderation
│       ├── notifications/    # User notifications
│       ├── posts/           # Post management
│       ├── relationships/   # User relationships
│       ├── search/          # Search functionality
│       ├── settings/        # User settings
│       ├── topics/          # Topic management
│       └── user/            # User management
│           ├── dto/
│           ├── user.controller.ts
│           ├── user.module.ts
│           └── user.service.ts
├── test/                    # Test files
├── scripts/                # Utility scripts
├── dist/                   # Compiled output
└── node_modules/           # Dependencies
```

The project follows a modular architecture pattern with clear separation of concerns:

- **Root Files**

  - `bootstrap.ts`: Application bootstrap configuration
  - `main.ts`: Application entry point
  - `schema.gql`: GraphQL schema definition
  - `generateSwagger.ts`: API documentation generator

- **Core Components**

  - `app/`: Core application setup with main module, controller, and service
  - `common/`: Shared utilities, decorators, guards, and configurations
  - `infra/`: Infrastructure services (Redis, S3, Email, etc.)

- **Feature Modules**
  Each module typically contains:
  - `*.controller.ts`: REST API endpoints
  - `*.service.ts`: Business logic
  - `*.module.ts`: Module configuration
  - `dto/`: Data Transfer Objects
  - Additional files for specific features (e.g., `*.gateway.ts` for WebSocket)

The architecture follows NestJS best practices with:

- Clear module separation
- Dependency injection pattern
- RESTful and GraphQL API support
- WebSocket integration for real-time features
- Comprehensive infrastructure services

## Core Framework Dependencies

### NestJS Core Components

The project is built on NestJS, a progressive Node.js framework that provides a robust foundation for building scalable server-side applications:

- `@nestjs/common`: Provides the core NestJS functionality, including decorators, pipes, guards, and interceptors.
- `@nestjs/core`: The main NestJS framework engine.
- `@nestjs/config`: Handles configuration management, including environment variables through dotenv integration.
- `@nestjs/platform-express`: Express integration for NestJS, providing the HTTP server platform.

### Database and ORM

The project uses Prisma ORM as its primary database interface, with a custom abstraction layer:

- `@photoglow/database`: A custom package that encapsulates Prisma ORM functionality. This package is designed to make database type definitions easily accessible to frontend components in the monorepo structure. While the backend directly uses Prisma ORM for database operations, this abstraction layer ensures type consistency across the frontend and backend, improving development experience and type safety.

### Real-time Communication

The project includes WebSocket support for real-time features:

- `@nestjs/platform-socket.io`: Socket.io integration for NestJS.
- `@nestjs/websockets`: WebSocket module for real-time bidirectional communication.

## Authentication and Security

The project implements JWT-based authentication:

- `@nestjs/passport`: Passport integration for authentication.
- `@nestjs/jwt`: JWT (JSON Web Token) module for handling authentication tokens.
- `passport`: Authentication middleware for Node.js.
- `passport-jwt`: Passport strategy for authenticating with JWT.

## AWS Integration

The project utilizes various AWS services through the AWS SDK:

- `@aws-sdk/client-s3`: AWS S3 client for file storage operations.
- `@aws-sdk/client-ses`: AWS SES client for email services.
- `@aws-sdk/lib-storage`: Enhanced S3 client with additional utilities.

## Data Validation and Transformation

- `class-validator`: Provides decorator-based validation.
- `class-transformer`: Enables transformation of plain objects to class instances.
- `reflect-metadata`: Required for decorator metadata reflection.

## File Processing and Media Handling

- `sharp`: High-performance image processing library.
- `multer`: Middleware for handling multipart/form-data.

## Utilities and Helpers

- `uuid`: Generates unique identifiers.
- `ms`: Converts various time formats.
- `dotenv`: Loads environment variables from .env files.
- `rxjs`: Reactive Extensions library for handling asynchronous data streams.
- `ioredis`: Redis client for Node.js.
- `googleapis`: Google APIs client library.

## API Documentation

- `@nestjs/swagger`: OpenAPI (Swagger) module for API documentation.

## GraphQL Setup (Minimal Implementation)

Note: While the following GraphQL-related packages are included, they are currently only set up for minimal verification. The API primarily follows a RESTful architecture:

- `@apollo/server`: Apollo GraphQL server.
- `@nestjs/apollo`: Apollo integration for NestJS.
- `@nestjs/graphql`: GraphQL module for NestJS.
- `graphql`: GraphQL JavaScript reference implementation.

## Development Dependencies

The project includes various development tools for code quality and testing:

### Testing

- `Bun`: Also a testing library.
- `@nestjs/testing`: NestJS testing utilities.
- `supertest`: HTTP assertions library.

### Code Quality

- `typescript`: TypeScript compiler and core types.
- `eslint`: JavaScript/TypeScript linter.
- `prettier`: Code formatter.
- `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`: TypeScript ESLint integration.

### Type Definitions

- `@types/express`: TypeScript definitions for Express.
- `@types/passport-jwt`: TypeScript definitions for Passport-JWT.
- `@types/multer`: TypeScript definitions for Multer.
- `@types/uuid`: TypeScript definitions for UUID.
- `@types/bun`: TypeScript definitions for Bun runtime.

## Workspace Dependencies

The project follows a monorepo structure with these internal workspace dependencies:

- `@photoglow/database`: A custom wrapper around Prisma ORM that exposes database type definitions to frontend components. This package serves as a bridge between the frontend and backend, ensuring consistent type usage across the entire application.
- `@photoglow/shared`: Internal shared utilities and components used throughout the application.

The workspace structure facilitates code sharing and maintains type consistency across different parts of the application, with the database package playing a crucial role in providing type definitions to frontend components while the backend continues to use Prisma ORM directly for database operations.

---

# License Information

All dependencies utilized in this project are distributed under permissive open-source licenses, including but not limited to MIT, Apache 2.0, and BSD licenses. These licenses grant generous rights for the use, modification, and redistribution of the software while maintaining minimal restrictions. Each dependency has been carefully vetted to ensure compliance with open-source licensing requirements, providing a solid legal foundation for both academic and potential commercial applications. For detailed license information about specific packages, please refer to their respective documentation or the LICENSE files in their repositories.
