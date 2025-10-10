# Conciliação Pro - Financial Reconciliation System

## Overview

Conciliação Pro is an enterprise-grade financial reconciliation application designed to automatically match and reconcile transactions across three data sources: ledger spreadsheets (Google Sheets), bank statements, and credit card statements. The system uses intelligent matching algorithms based on value, date tolerance, and text similarity to identify corresponding transactions and categorize them into reconciled, pending ledger entries, and pending statement entries.

The application provides a professional dashboard interface for financial data management, file uploads, reconciliation workflows, and transaction tracking with support for both light and dark themes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: shadcn/ui (Radix UI primitives) with Tailwind CSS
- Design approach follows Material Design 3 principles adapted for fintech dashboards
- Custom theme system with CSS variables supporting light/dark modes
- Professional color palette optimized for financial data clarity (blue primary, green success, amber warning, red error)
- Typography uses Inter font for exceptional readability in financial contexts

**Routing**: wouter for lightweight client-side routing

**State Management**: 
- TanStack Query (React Query) for server state and data fetching
- Local React state for UI interactions
- Custom theme context for light/dark mode persistence

**Key Design Patterns**:
- Component composition with reusable UI primitives
- Separation of business logic from presentation components
- Custom hooks for shared functionality (mobile detection, toast notifications)
- Data-first hierarchy prioritizing information clarity over decorative elements

### Backend Architecture

**Runtime**: Node.js with Express server

**Database**: PostgreSQL via Neon serverless with Drizzle ORM
- Schema-first design with TypeScript type safety
- Uses WebSocket connections for serverless Postgres
- Migration support through drizzle-kit

**API Structure**: RESTful endpoints with `/api` prefix
- Express middleware for JSON parsing and request logging
- Centralized error handling
- Development-only Vite integration for HMR

**Storage Layer**: 
- Abstracted storage interface (IStorage) allowing multiple implementations
- In-memory storage for development (MemStorage)
- Database storage ready for production
- CRUD operations for user management

**Authentication**: User-based system with username/password schema (implementation pending)

### Core Reconciliation Algorithm

The matching system compares transactions using three criteria:
1. **Value matching**: Exact amount correspondence
2. **Date tolerance**: Configurable range (default ±2 days)
3. **Text similarity**: Description/historical text analysis with confidence scoring

Transactions are categorized into:
- **Reconciled**: Matches found across all sources (ledger + bank/card)
- **Pending Ledger**: Entries only in spreadsheet (awaiting payment/receipt)
- **Pending Statement**: Entries only in statements (unexpected transactions or fees)

### Data Import Pipeline

**Supported Formats**:
- Bank/Card Statements: OFX and CSV files
- Ledger Spreadsheets: Google Sheets integration (API-based)

**Upload Flow**:
1. File drag-and-drop or selection via FileUploadZone component
2. Client-side validation of file types and sizes
3. Server-side parsing and normalization
4. Storage in database with source tracking
5. Automatic reconciliation trigger

### External Dependencies

**Third-Party Services**:
- Google Sheets API for ledger synchronization (requires API key configuration)
- Google Fonts CDN for Inter typography
- Neon serverless PostgreSQL for database hosting

**Key NPM Packages**:
- `@neondatabase/serverless`: Serverless Postgres client with WebSocket support
- `drizzle-orm`: TypeScript ORM with schema validation
- `@tanstack/react-query`: Data fetching and caching
- `@radix-ui/*`: Accessible UI primitives (20+ components)
- `date-fns`: Date manipulation and formatting (with pt-BR locale)
- `react-day-picker`: Calendar and date range selection
- `wouter`: Lightweight routing
- `tailwindcss`: Utility-first CSS framework
- `zod`: Runtime type validation for API schemas

**Development Tools**:
- Vite with React plugin for fast HMR
- TypeScript with strict mode enabled
- ESBuild for production bundling
- Replit-specific plugins for development experience

### Configuration Management

**Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Development/production mode flag

**Build Configuration**:
- Path aliases for clean imports (`@/`, `@shared/`, `@assets/`)
- Separate client/server build outputs
- Development server with file system restrictions for security

**Theme Customization**:
- CSS custom properties for color system
- Tailwind configuration with extended utilities
- Light/dark mode via class-based switching
- Professional color palette optimized for financial data

### Security Considerations

- File system access restrictions in development
- CORS and credential handling for API requests
- Input validation via Zod schemas
- Password storage (implementation required for production)
- Session management (pending implementation)