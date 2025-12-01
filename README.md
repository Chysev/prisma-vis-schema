# Prisma Visual Schema Builder

A comprehensive full-stack application designed for visual database schema management using Prisma ORM. The system provides an intuitive drag-and-drop interface for creating, managing, and deploying database schemas with real-time visualization capabilities.

## Architecture Overview

This application implements a modern web-based database schema design tool that bridges the gap between visual database modeling and Prisma schema generation. The system supports complete database lifecycle management from initial design through production deployment.

## Core Features

### Schema Design & Visualization

- Interactive visual schema designer with drag-and-drop functionality
- Real-time relationship mapping between database entities
- Support for all Prisma relationship types (one-to-one, one-to-many, many-to-many)
- Enum type creation and integration with model fields
- Field-level configuration including constraints, defaults, and native database types

### Database Operations

- Live Prisma schema generation and validation
- Integrated Prisma CLI operations (migrations, introspection, code generation)
- Multi-database provider support (MySQL, PostgreSQL, SQLite, MongoDB, CockroachDB)
- Schema versioning and migration management
- Database synchronization and deployment tools

### Project Management

- Multi-project workspace with persistent storage
- Schema import/export functionality
- Project collaboration and sharing capabilities
- Version control integration for schema changes
- Backup and restore operations

### Security & Authentication

- JWT-based authentication system
- API key management and encryption
- Role-based access control
- Secure key generation utilities
- Environment-specific configuration management

## Technology Stack

### Backend Infrastructure

- **Runtime Environment**: Node.js with Express.js framework
- **Language**: TypeScript with strict type checking
- **Database Layer**: Prisma ORM with multi-provider support
- **Primary Database**: MySQL (with PostgreSQL, SQLite, MongoDB support)
- **Authentication**: JSON Web Token (JWT) implementation
- **Caching Layer**: Redis integration (optional)
- **Real-time Communication**: Socket.io WebSocket implementation
- **API Architecture**: RESTful services with middleware pipeline

### Frontend Application

- **Framework**: React 19 with TypeScript
- **Build System**: Vite with hot module replacement
- **Routing**: TanStack Router with type-safe navigation
- **State Management**: TanStack Query for server state and caching
- **Visual Editor**: ReactFlow for interactive schema diagrams
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Notifications**: Sonner toast notification system
- **HTTP Client**: Xior for API communication

## System Requirements

- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: npm (v8+) or yarn (v1.22+)
- **Database Server**: MySQL 5.7+ (primary) or PostgreSQL 12+, SQLite 3.35+
- **Version Control**: Git 2.25+

## Installation & Configuration

### Step 1: Repository Setup

Clone the repository and navigate to the project directory:

```bash
git clone <your-repository-url>
cd prisma-vis-schema
```

### Step 2: Dependency Installation

Install all required dependencies for both backend and frontend applications:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd ui
npm install
cd ..
```

### Step 3: Environment Configuration

Configure environment variables for your development environment:

```bash
cp .env.dev .env
```

Edit `.env` with your database and application settings:

```env
# Server Configuration
PORT="5000"
VERSION="v1"
BASEROUTE="api"
WHITELIST="http://localhost:5173"

# Environment
NODE_ENV="development"

# Database
DATABASE_URL="mysql://username:password@localhost:3306/your_database_name"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# Security Keys (Generate new ones for production)
ENC_KEY_SECRET="your_encryption_key_here"
CIPHER_KEY_SECRET="your_cipher_key_here"
API_KEY_SECRET="your_api_key_secret_here"
API_KEY="your_generated_api_key_here"
```

### Step 4: Database Initialization

Create the application database:

```sql
CREATE DATABASE prisma_vis_schema;
```

Initialize the database schema and generate the Prisma client:

```bash
# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

### Step 5: Development Environment Startup

Launch the development environment:

```bash
# Start both backend and frontend servers concurrently
npm run dev

# Alternative: Start servers independently
# Backend server only
npm run dev:backend

# Frontend server only (separate terminal)
npm run dev:frontend
```

**Service Endpoints:**

- Frontend Application: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/docs (if enabled)

## Development Scripts

### Backend Scripts

```bash
npm run dev                 # Start both frontend and backend in development mode
npm run dev:backend        # Start only the backend server
npm run build:production   # Build for production
npm run production         # Start production server
npm run check:types        # Type check the code
```

### Prisma Scripts

```bash
npm run prisma:format      # Format the Prisma schema
npm run prisma:generate    # Generate Prisma client
npm run prisma:db-push     # Push schema changes to database
npm run prisma:migrate     # Create and run migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Run database seeding
```

### Frontend Scripts

```bash
cd ui
npm run dev                # Start Vite development server
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Run ESLint
```

## Application Usage Guide

### Authentication & Access Control

The application implements a secure authentication system:

1. **User Registration**: Create a new account with email and password
2. **Authentication**: Login with credentials to receive JWT tokens
3. **Session Management**: Automatic token refresh and secure session handling
4. **Access Control**: Role-based permissions for project operations

### Project Management Workflow

**Project Creation:**

1. Access the dashboard and select "New Project"
2. Configure database provider settings (MySQL, PostgreSQL, SQLite, MongoDB)
3. Set database connection parameters
4. Define project metadata and naming conventions

**Schema Design Process:**

1. **Entity Modeling**: Drag "Model" components from the component palette
2. **Enumeration Types**: Create "Enum" types for constrained value sets
3. **Attribute Configuration**: Configure fields, constraints, and data types
4. **Relationship Mapping**: Establish entity relationships through visual connections
5. **Type Integration**: Assign enum types to model fields for type safety

**Schema Deployment:**

1. **Schema Generation**: Real-time Prisma schema compilation and validation
2. **Export Operations**: Download generated schema files
3. **Migration Management**: Execute database migrations through integrated CLI
4. **Version Control**: Automatic project versioning and change tracking

## Project Architecture

```
prisma-vis-schema/
├── src/                    # Backend source code
│   ├── config/            # Configuration files
│   ├── db/                # Database connections (Prisma, Redis)
│   ├── gen/               # Key generators and utilities
│   ├── lib/               # Shared libraries and utilities
│   ├── middleware/        # Express middleware
│   ├── network/           # API routes and controllers
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Helper utilities
│   ├── index.ts           # Express app configuration
│   └── server.ts          # Server entry point
├── ui/                    # Frontend React application
│   ├── public/            # Static assets
│   └── src/
│       ├── app/           # Application pages and routes
│       ├── components/    # Reusable UI components
│       ├── contexts/      # React contexts
│       ├── db/            # Frontend data layer (TanStack Query)
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Frontend utilities
│       ├── types/         # TypeScript type definitions
│       └── utils/         # Helper functions
├── prisma/                # Database schema and migrations
│   ├── migrations/        # Database migration files
│   └── schema.prisma      # Main Prisma schema
├── scripts/               # Build and utility scripts
└── temp/                  # Temporary files
```

## Configuration Management

### Database Provider Configuration

The application supports multiple database providers. Update your `DATABASE_URL` accordingly:

**MySQL:**

```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

**PostgreSQL:**

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

**SQLite:**

```env
DATABASE_URL="file:./dev.db"
```

### Security Configuration

The application uses several security keys for encryption, API authentication, and data protection. **Never use the default keys in production!**

#### Generate New Security Keys

The project includes built-in key generators in the `src/gen/` directory:

**1. Generate Encryption and Cipher Keys:**

```bash
# Navigate to project root
cd prisma-vis-schema

# Generate new encryption and cipher keys
npx ts-node src/gen/genSecretToken.ts
```

This will output:

```
ENC_KEY_SECRET: [64-character hex string]
CIPHER_KEY_SECRET: [64-character hex string]
```

**2. Generate API Key Secret:**

```bash
# Generate a random 32-byte API key secret
node -e "console.log('API_KEY_SECRET:', require('crypto').randomBytes(32).toString('hex'))"
```

**3. Generate Encrypted API Key:**

```bash
# After setting your API_KEY_SECRET in .env, generate the API key
npx tsx src/gen/genApiKey.ts
```

#### Complete Key Generation Process:

```bash
# 1. Generate all encryption keys
npx tsx src/gen/genSecretToken.ts

# 2. Generate API key secret
node -e "console.log('API_KEY_SECRET:', require('crypto').randomBytes(32).toString('hex'))"

# 3. Update your .env file with the generated keys
# 4. Generate the encrypted API key
npx tsx src/gen/genApiKey.ts
```

#### Key Descriptions:

- **ENC_KEY_SECRET**: Used for general encryption operations (64-char hex)
- **CIPHER_KEY_SECRET**: Used for cipher operations (64-char hex)
- **API_KEY_SECRET**: Used for API key encryption (64-char hex)
- **API_KEY**: Encrypted API key for client authentication (generated from API_KEY_SECRET)

**⚠️ Security Notes:**

- Keep all keys secret and never commit them to version control
- Use different keys for development, staging, and production
- Store production keys in secure environment variable systems
- Rotate keys periodically for enhanced security

### Redis Caching Configuration (Optional)

To enable Redis caching for improved performance:

**Prerequisites:**

1. Install Redis server (version 6.0+)
2. Configure Redis security settings
3. Set up Redis persistence if required

**Application Configuration:**

1. Update `REDIS_URL` in environment configuration
2. Enable Redis connection in `src/server.ts`
3. Configure caching strategies for optimal performance
4. Set up Redis monitoring and health checks

## Production Deployment

### Build Process

Compile the application for production deployment:

```bash
# Build backend application
npm run build:production

# Build frontend application
cd ui && npm run build && cd ..
```

### Environment Configuration

1. Configure production environment variables
2. Set up secure database connections
3. Configure SSL certificates and security headers
4. Set up monitoring and logging systems

### Server Deployment

```bash
# Start production server
npm run production
```

### Containerization

The application includes Docker configuration files for containerized deployment. Reference the `.dockerignore` file for optimization settings.

## Troubleshooting & Diagnostics

### Database Connectivity Issues

**Connection Failures:**

- Validate `DATABASE_URL` configuration syntax
- Verify database server accessibility and port availability
- Confirm database user permissions and authentication credentials
- Test network connectivity between application and database server

**Schema Migration Problems:**

- Execute `npm run prisma:db-push` for development schema synchronization
- Resolve naming conflicts between model and enum declarations
- Validate Prisma schema syntax using `npm run prisma:format`
- Check migration history for conflicting changes

**Build and Compilation Errors:**

- Clear dependency cache: `rm -rf node_modules && npm install`
- Verify environment variable configuration
- Run TypeScript compilation check: `npm run check:types`
- Review build logs for specific error details

### Development Best Practices

**Database Management:**

- Utilize `npm run prisma:studio` for database inspection and debugging
- Implement proper indexing strategies for performance optimization
- Use database connection pooling for production environments

**Debugging Strategies:**

- Monitor browser developer console for frontend error tracking
- Implement structured logging for backend service monitoring
- Utilize the integrated validation system to prevent schema conflicts
- Set up proper error boundaries and fallback mechanisms

**Performance Optimization:**

- Implement query optimization for large schema operations
- Use lazy loading for complex visual components
- Monitor memory usage during extensive schema editing sessions

## License

This project is licensed under the MIT License. See the LICENSE file for complete terms and conditions.

## Contributing

Contributions to the Prisma Visual Schema Editor are welcome. Please follow these guidelines:

1. Fork the repository and create a feature branch
2. Implement changes with appropriate test coverage
3. Ensure code quality with `npm run check:types` and linting
4. Submit a pull request with detailed description of changes
5. Maintain backward compatibility and update documentation

## Support & Maintenance

**Issue Reporting:**

1. Review existing documentation and troubleshooting guides
2. Search existing GitHub issues for similar problems
3. Create detailed issue reports with reproduction steps
4. Include system information and error logs

**Technical Support:**

- Community support through GitHub Issues
- Documentation updates and improvements
- Feature requests and enhancement proposals

---

**Developed and maintained by ChyDev Engineering Team**
