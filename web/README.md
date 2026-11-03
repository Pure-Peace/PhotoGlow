# @photoglow/web

## Overview

The `@photoglow/web` package provides PhotoGlow's frontend application using Next.js with hybrid rendering capabilities. Built with the latest web technologies released in 2024-2025, frontend delivers exceptional performance and developer experience.

## Stacks

- **Next.js 15**
- **React 19** 
- **TailwindCSS v4**

## Development Environment

Before starting development, ensure your environment variables are properly configured in the `.env` file:

```env
FRONTEND_URL=http://localhost:8080
INTERNAL_API_URL=http://localhost:8001
NEXT_PUBLIC_API_URL=http://localhost:8080
```

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
```

### Important Notes

Type checking requires special attention when using Bun as your development environment. Since Bun doesn't perform automatic type checking during development, you should:

- Run `bun run type-check` regularly during development
- Always check types before committing changes
- Verify type safety before creating production builds

Without manual type checking, you might encounter situations where code works in development but fails during production builds.

## Package Structure

```
web/
├── src/                     # Source code directory
│   ├── api/                # API integration layer
│   │   ├── endpoints/      # API endpoint definitions
│   │   │   ├── auth.ts     # Authentication endpoints
│   │   │   ├── chat.ts     # Chat related endpoints
│   │   │   ├── comments.ts # Comment management
│   │   │   ├── interactions.ts # User interactions
│   │   │   ├── media.ts    # Media handling
│   │   │   ├── mentions.ts # User mentions
│   │   │   ├── moderation.ts # Content moderation
│   │   │   ├── notifications.ts # User notifications
│   │   │   ├── posts.ts    # Post management
│   │   │   ├── search.ts   # Search functionality
│   │   │   ├── settings.ts # User settings
│   │   │   ├── social.ts   # Social interactions
│   │   │   ├── topics.ts   # Topic management
│   │   │   └── user.ts     # User management
│   │   └── index.ts        # API client configuration
│   │
│   ├── app/                # Next.js app directory
│   │   ├── chat/          # Chat feature
│   │   ├── explore/       # Content exploration
│   │   │   └── [topicName]/ # Topic-specific pages
│   │   ├── following/     # Following feed
│   │   ├── notifications/ # Notifications center
│   │   ├── profile/       # User profiles
│   │   │   └── [username]/  # User-specific pages
│   │   │       └── photo/   # Photo viewing pages
│   │   ├── search/        # Search interface
│   │   ├── settings/      # User settings
│   │   ├── upload/        # Content upload
│   │   ├── context/       # React contexts
│   │   └── error/         # Error handling
│   │
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── chat/          # Chat components
│   │   ├── common/        # Shared components
│   │   ├── explore/       # Exploration components
│   │   ├── following/     # Following components
│   │   ├── linkify/       # Text linking components
│   │   ├── nav/           # Navigation components
│   │   ├── notifications/ # Notification components
│   │   ├── post/          # Post-related components
│   │   ├── profile/       # Profile components
│   │   ├── search/        # Search components
│   │   ├── settings/      # Settings components
│   │   ├── text-editor/   # Rich text editor
│   │   ├── theme/         # Theme management
│   │   ├── ui/            # UI components library
│   │   └── upload/        # Upload components
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── auth.ts        # Authentication hooks
│   │   ├── hydrate.ts     # Hydration utilities
│   │   ├── use-onscreen.ts # Visibility detection
│   │   └── use-socket.ts   # WebSocket hooks
│   │
│   ├── lib/               # Utility functions
│   │   ├── auth.ts        # Auth utilities
│   │   ├── date.ts        # Date formatting
│   │   ├── regex.ts       # Regular expressions
│   │   └── utils.ts       # General utilities
│   │
│   ├── stores/            # State management
│   │   ├── auth.ts        # Auth state
│   │   ├── notifications.ts # Notifications state
│   │   ├── post-dialog.ts  # Post dialog state
│   │   ├── upload.ts       # Upload state
│   │   └── sidebar-store.ts # Sidebar state
│   │
│   ├── styles/            # Global styles
│   │   └── globals.css     # Global CSS
│   │
│   └── middleware.ts      # Next.js middleware
│
├── public/              # Static files and assets
├── .next/               # Next.js build output
├── node_modules/        # Project dependencies
├── .vscode/            # VS Code configuration
├── next.config.ts      # Next.js configuration
├── tsconfig.json       # TypeScript configuration
├── postcss.config.mjs  # PostCSS configuration
├── prettier.config.mjs # Prettier configuration
├── eslint.config.mjs   # ESLint configuration
├── components.json     # UI components configuration
└── package.json        # Project dependencies and scripts
```

Key directories and their purposes:

- `src/api/`: API integration layer

  - `endpoints/`: Organized API endpoints for different features
  - Type-safe API client configuration and utilities

- `src/app/`: Next.js App Router pages and layouts

  - Feature-specific pages (chat, explore, profile, etc.)
  - Dynamic routes for topics and user profiles
  - Global layout and error handling

- `src/components/`: React component library

  - Feature-specific components organized by domain
  - Common UI components and shared utilities
  - Comprehensive UI component library in `ui/`
  - Navigation and layout components
  - Rich text editor implementation

- `src/hooks/`: Custom React hooks

  - Authentication and authorization hooks
  - Real-time communication via WebSocket
  - Utility hooks for common patterns

- `src/lib/`: Utility functions and helpers

  - Authentication utilities
  - Date formatting and manipulation
  - Regular expressions and validation
  - General purpose utilities

- `src/stores/`: State management

  - Authentication state
  - UI state (dialogs, sidebar)
  - Feature-specific states (notifications, uploads)

- `src/styles/`: Global styling
  - Global CSS and theme definitions

## Core Framework and Runtime

- `next` (v15): The core Next.js framework that enables server-side rendering, routing, and other essential features
- `react` (v19): The fundamental library for building user interfaces
- `react-dom`: React's DOM-specific methods for web applications
- `tailwindcss` (v4): A utility-first CSS framework for rapid UI development

## UI Components and Styling

### shadcn/ui Components

The project uses `shadcn/ui` , a collection of accessible and customizable components built on top of `Radix UI`. These components provide a robust foundation for the user interface, including:

- Alert dialogs and modals
- Avatar components
- Dropdown menus
- Form elements (labels, inputs, selects)
- Progress indicators
- Scroll areas
- Tabs and navigation elements
- Accessibility features

All components follow best practices for web accessibility and are fully customizable using Tailwind CSS.

### Styling and Animation

Our styling system combines several powerful tools:

- `class-variance-authority`: For creating variant-based components
- `clsx` and `tailwind-merge`: Utilities for managing CSS classes
- `framer-motion`: For advanced animations
- `tw-animate-css`: Animation utilities for Tailwind

### Icon lib

- `lucide`

## Rich Text Editing

The project uses `Tiptap`, a modern rich-text editor framework for React. Tiptap provides a powerful and extensible WYSIWYG editor that supports features like:

- Document structure and formatting
- Character counting
- Undo/redo functionality
- @mention integration
- Placeholder text
- Suggestion/autocomplete capabilities

The editor is built on top of ProseMirror, ensuring reliability and extensibility for advanced text editing needs.

## Form Handling and Validation

Our form handling system combines several tools:

- `react-hook-form`: For efficient form state management
- `zod`: For TypeScript-first schema validation

## Media and File Handling

For handling media and files, we use:

- `react-avatar-editor`: For editing pictures
- `react-dropzone`: For file drag-and-drop functionality
- `react-zoom-pan-pinch`: For image zoom and pan capabilities

## Real-time Communication

`Socket.IO` powers our real-time features, providing WebSocket implementation for both client and server sides.

## Development Tools

Our development environment is enhanced by:

- `TypeScript`: For static type checking
- `ESLint`: For code linting
- `Prettier`: For code formatting
- `@types/{xxx}`: Various TypeScript type definitions

## State Management and Utilities

Additional utilities include:

- `zustand`: For state management
- `date-fns`: For date manipulation
- `next-themes`: For theme management
- `linkifyjs`: For converting text to clickable links
- `sonner`: For toast notifications
- `tippy.js`: For tooltips
- `unique-username-generator`: For generating unique usernames

## Workspace Dependencies

Internal workspace dependencies:

- `@photoglow/sdk`: Internal SDK package
- `@photoglow/shared`: Shared utilities and components

---

# License Information

All dependencies utilized in this project are distributed under permissive open-source licenses, including but not limited to MIT, Apache 2.0, and BSD licenses. These licenses grant generous rights for the use, modification, and redistribution of the software while maintaining minimal restrictions. Each dependency has been carefully vetted to ensure compliance with open-source licensing requirements, providing a solid legal foundation for both academic and potential commercial applications. For detailed license information about specific packages, please refer to their respective documentation or the LICENSE files in their repositories.
