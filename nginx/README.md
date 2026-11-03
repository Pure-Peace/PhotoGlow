# Nginx Configuration

In a production deployment, [Nginx](https://nginx.org/) serves as a reverse proxy and gateway, handling all incoming requests before routing them to appropriate services. External links are not processed directly through `server` or `web` services, but are instead managed by Nginx for enhanced security and performance.

## Configuration Structure

- `nginx.conf`: Main configuration file with global settings
- `conf.d/default.conf`: Virtual host configuration for the application

## Key Features

### Security

- SSL/TLS support (TLS 1.2 and 1.3)
- Security headers (XSS Protection, Content Security Policy, etc.)
- Rate limiting for API endpoints (5 requests/second with burst of 10)
- Server tokens disabled for security

### Performance

- GZIP compression enabled for various content types
- Optimized SSL session handling
- Efficient worker process management
- Keepalive connections supported

### Routing

- Frontend requests proxied to web service (port 8080)
- API requests proxied to server service (port 8001)
- WebSocket support for real-time features
- Special handling for OAuth callbacks

### Additional Features

- Support for file uploads up to 50MB
- HTTP to HTTPS redirection (when SSL enabled)
- Detailed access and error logging
- Support for Let's Encrypt SSL certificate automation

## Development vs Production

In development, you might interact with the services directly. However, in production, all traffic flows through Nginx, which provides:

- Load balancing (when configured)
- SSL termination (cloudflare can provide this)
- Request routing
- Security features
- Performance optimization

To modify the configuration, update the files in the `conf.d` directory and reload Nginx.
