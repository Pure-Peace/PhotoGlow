# @photoglow/database

## Overview

The `@photoglow/database` package serves as the foundation for PhotoGlow's data layer, using Prisma ORM to manage our PostgreSQL database. This package centralizes our database schema definitions and provides type-safe database access for other packages, particularly the server package.

## Understanding Prisma in PhotoGlow

Prisma helps us work with our database in a type-safe way. When we make changes to our database schema in the `schema.prisma` file, Prisma generates TypeScript types and a database client that ensures our database operations are both safe and efficient. Think of it as a bridge between our TypeScript code and the PostgreSQL database.

## Environment Setup

Before working with the database package, you need to configure your database connection. Create a `.env` file in the root directory and set your `DATABASE_URL`. The URL follows this structure:

```env
DATABASE_URL="postgresql://username:password@hostname:port/database_name?schema=public"
```

For example, a local development setup might look like:

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/photoglow?schema=public"
```

## Development Workflow

A typical development workflow might look like this:

1. Make changes to your schema in `schema.prisma`
2. Run `bun run migrate` to create and apply a migration
3. Run `bun run generate` to update the Prisma client
4. Test your changes in the server package
5. Commit both schema changes and migration files

## Troubleshooting

Common issues you might encounter:

1. Database connection errors: Check your DATABASE_URL and ensure PostgreSQL is running.

2. Migration conflicts: Run `bun run reset` in development to start fresh, but never in production.

3. Type errors in the server package: Make sure to run `generate` after schema changes.

4. Schema drift: Use `bun run pull` to sync your schema with the database if they become out of sync.

For more detailed information about database schema, migrations, and advanced Prisma features, refer to our internal documentation.

## Database Commands

Let's explore each database command and understand what it does:

### Setting Up Your Database

```bash
# Create database tables and constraints based on your migrations
bun run migrate

# Generate the Prisma client for type-safe database access
bun run generate
```

The migrate command reads your migration files and creates your database structure. The generate command creates a Prisma client that provides type-safe access to your database. Always run both commands together to ensure your database and its client are in sync.

### Managing Schema Changes

When you modify the schema.prisma file, you have several options for applying those changes:

```bash
# Create a new migration and apply it
bun run migrate

# Push schema changes directly to the database (for development)
bun run push

# Update the schema based on database changes
bun run pull
```

Choose the appropriate command based on your needs:

- Use `migrate` when you want to track changes in version control
- Use `push` during development for quick schema updates
- Use `pull` when you need to update your schema to match database changes

### Database Reset

```bash
# Reset your database (removes all data)
bun run reset
```

This command completely resets your database by **dropping all tables** and recreating them. Use it cautiously as it deletes all data.

## Best Practices

When working with the database package:

1. Always run both `migrate` and `generate` after schema changes to ensure consistency.

2. Use migrations rather than direct pushes in production environments to maintain data integrity.

3. Keep your schema files well-documented with comments explaining relationships and constraints.

4. Be cautious with the reset command as it permanently deletes all data.

5. Consider the impact of schema changes on existing data and application features.

## Integration with Other Packages

The `@photoglow/database` package primarily interacts with the `@photoglow/server` package, which uses the generated Prisma client for database operations. For example:

1. The server package imports the Prisma client from this package.
2. The shared package uses the generated types for maintaining type safety across the application.
3. The schema serves as the single source of truth for our data structure.

## Schema Organization

Our Prisma schema is organized into several key models that work together to support PhotoGlow's features:

### Core Models

1. **User Model**

   - Central to user identity and authentication
   - Stores essential user information (email, username, password, profile details)
   - Tracks user statistics (followers, following counts)
   - Manages user status and verification states
   - Connected to most other models through various relationships

2. **Post Model**

   - Primary content container for photos, videos, and articles
   - Supports different content types through PostType enum
   - Implements visibility control (public, private, followers)
   - Tracks engagement metrics (comments, likes, saves)
   - Organized with topics and tags for better content discovery

3. **Media & Content Models**

   - `Media`: Handles actual media files attached to posts
   - `MediaDraft`: Manages upload process and temporary storage
   - `MediaStats`: Tracks user upload statistics and quotas

4. **Social Interaction Models**

   - `Comment`: Supports nested discussions through parent-child relationships
   - `Like`: Handles user reactions to posts and comments
   - `Save`: Allows users to bookmark content
   - `Follow`: Manages user-to-user connections
   - `Block`: Implements user privacy and safety features

5. **Communication Models**

   - `Conversation`: Manages private messaging between users
   - `Message`: Stores individual messages within conversations
   - `Notification`: Handles system-wide notifications for various events

6. **Organization & Discovery Models**
   - `Location`: Geotags posts for location-based discovery
   - `Topic`: Categorizes content into broad themes
   - `Tag`: Provides flexible content labeling and discovery

### Authentication & Security

- `RefreshToken`: Manages secure session handling
- `OAuthAccount`: Supports multiple social login providers
- Built-in security features like password hashing and email verification

### Design Principles

1. **Relationship Management**

   - Extensive use of relations to maintain data integrity
   - Careful consideration of cascade deletes
   - Optimized indexes for common query patterns

2. **Scalability Considerations**

   - Counters (likes, followers) stored at the entity level
   - Efficient indexing strategy for high-traffic queries
   - Separation of concerns between different content types

3. **Data Integrity**

   - Strong use of enums for constrained choices
   - Required vs optional fields clearly defined
   - Appropriate field types and lengths for different data

4. **Performance Optimization**
   - Strategic indexes on frequently queried fields
   - Composite indexes for common filter combinations
   - Efficient relationship loading through careful model design

### Best Practices for Schema Evolution

1. Always create migrations for schema changes
2. Consider the impact on existing data
3. Maintain backward compatibility when possible
4. Document significant schema changes
5. Test migrations on a copy of production data first

This schema design provides a solid foundation for PhotoGlow's features while maintaining flexibility for future growth and changes.

---

# License Information

All dependencies utilized in this project are distributed under permissive open-source licenses, including but not limited to MIT, Apache 2.0, and BSD licenses. These licenses grant generous rights for the use, modification, and redistribution of the software while maintaining minimal restrictions. Each dependency has been carefully vetted to ensure compliance with open-source licensing requirements, providing a solid legal foundation for both academic and potential commercial applications. For detailed license information about specific packages, please refer to their respective documentation or the LICENSE files in their repositories.
