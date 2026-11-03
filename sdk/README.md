# @photoglow/sdk

`@photoglow/sdk` is a powerful multi-language SDK generator that creates client libraries for interacting with the PhotoGlow API. It utilizes OpenAPI Generator to provide consistent and well-documented SDKs across multiple programming languages.

## Features

- **Multi-language Support**: Generate SDKs for multiple programming languages from a single API specification
- **Auto-generated Documentation**: Comprehensive HTML documentation
- **Postman Collection**: Ready-to-use Postman collection for API testing
- **Type Safety**: Strong typing support for TypeScript/JavaScript implementations
- **Modern Tooling**: Built with Bun for fast and efficient development

## Prerequisites

- [Bun](https://bun.sh/) runtime environment
- PhotoGlow server running on `localhost:8001`

## Installation

```sh
# Clone the repository
git clone <repository-url>

# Install dependencies
bun install
```

## Usage

### Generate SDKs

Before generating SDKs, ensure the PhotoGlow server is running and accessible at `localhost:8001`.

#### Generate All SDKs

```sh
bun run gen
```

#### Generate Documentation

```sh
bun run docs
```

View the generated documentation at `./docs/index.html`

#### Generate Postman Collection

```sh
bun run postman
```

Import the generated collection from `./postman/postman.json`

### Language-specific SDK Generation

The following commands generate SDKs for specific languages:

```sh
# TypeScript (both Axios and Fetch variants)
bun run gen:ts

# Individual TypeScript variants
bun run gen:ts-axios    # TypeScript with Axios
bun run gen:ts-fetch    # TypeScript with Fetch

# Other Languages
bun run gen:rust        # Rust
bun run gen:python      # Python
bun run gen:java        # Java
bun run gen:go          # Go
bun run gen:kotlin      # Kotlin
bun run gen:android     # Android
bun run gen:csharp      # C#
bun run gen:javascript  # JavaScript
```

Generated SDKs can be found in the `./platform/<language>` directory.

## SDK Structure

- `/docs` - Generated API documentation
- `/platform` - Generated SDKs for different languages (Note: To avoid repo being too large, it is excluded by .gitignore)
- `/postman` - Postman collection for API testing

## Configuration

SDK generation is configured through `openapitools.json`. Each generator can be customized with language-specific options.

## Available Languages

To see all available language generators:

```sh
bun run openapi-generator-cli list
```

---

# License Information

All dependencies utilized in this project are distributed under permissive open-source licenses, including but not limited to MIT, Apache 2.0, and BSD licenses. These licenses grant generous rights for the use, modification, and redistribution of the software while maintaining minimal restrictions. Each dependency has been carefully vetted to ensure compliance with open-source licensing requirements, providing a solid legal foundation for both academic and potential commercial applications. For detailed license information about specific packages, please refer to their respective documentation or the LICENSE files in their repositories.
