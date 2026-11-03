# @photoglow/shared

## Overview

`@photoglow/shared` is a core TypeScript module that provides a unified collection of utilities, types, and configurations used throughout the PhotoGlow platform, promoting code consistency and efficiency.

## Features

### Environment Configuration

- Site configuration (frontend URL, server port)
- Redis connection settings
- AWS S3 and SES configurations
- JWT and token management
- Google OAuth settings
- Verification code settings

### Type Definitions

- API response and request types
- User management types
- Content types (posts, comments, topics)
- Chat and notification systems
- Profile and search functionality
- Token and verification types

### Validation

- Username validation regex patterns
- Display name validation with support for multilingual characters

## Directory Structure

```
shared/
├── server          # Server only (redis key)
├── types/          # Shared TypeScript type definitions
├── env.ts          # Environment configuration and defaults
└── regex.ts        # Regular expression patterns for validation
```

## Installation

This package is private and meant to be used as a workspace dependency within the PhotoGlow project.

```json
{
  "dependencies": {
    "@photoglow/shared": "workspace:*"
  }
}
```

## Dependencies

- TypeScript ^5.0.0
- @photoglow/database (workspace dependency)
