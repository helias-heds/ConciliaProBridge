# Conciliação Pro - Car Financing Reconciliation System

## Overview

Conciliação Pro is an enterprise-grade financial reconciliation application designed specifically for a car financing company. The system automatically matches and reconciles payment transactions (parcelas) across three data sources: ledger spreadsheets (Google Sheets), bank statements, and credit card statements. 

The system tracks customer payments for financed vehicles, allowing the finance team to verify if received payments match the expected entries in their accounting ledger. Each transaction includes customer information, the financed car details, payment amounts, and reconciliation status.

The application provides a professional dashboard interface for financial data management, file uploads, reconciliation workflows, and transaction tracking with support for both light and dark themes.

## Recent Changes (October 2025)

### CSV Reconciliation Implementation (October 14, 2025)
- **Automatic Transaction Matching**: System now reconciles CSV bank statements with Google Sheets ledger data
  - **Required matching criteria** (ALL must be met):
    1. Date match with ±2 days tolerance
    2. Exact value/amount match
    3. Payment method MUST be "Zelle" (extracted from CSV description)
    4. Customer/depositor name MUST match (CSV depositor vs. Sheet client/depositor)
  - **CSV Parser enhancements**:
    - Detects "Zelle" keyword in description and stores as paymentMethod
    - Extracts depositor name from text after "from" keyword
    - Example: "Zelle from John Smith" → paymentMethod="Zelle", depositor="John Smith"
  - **Reconciliation Algorithm** (server/reconciliation.ts):
    - Compares pending-statement (CSV) with pending-ledger (Google Sheets) transactions
    - Calculates confidence score: date(25) + value(25) + Zelle(20) + name match(10-30) = 60-100%
    - Updates matched transactions to "reconciled" status with confidence score
    - Links transactions via matchedTransactionId field
  - **Database Schema**: Added paymentMethod and matchedTransactionId fields to transactions table
  - **UI Integration**: Upload page now has "Reconciliation" card with "Start Reconciliation" button

### Dashboard Real Data Integration (October 14, 2025)
- **Removed Mock Data**: Dashboard now fetches real transactions from API using React Query
  - GET /api/transactions endpoint returns all transactions from in-memory storage
  - Automatic data transformation: date strings → Date objects, value strings → numbers
  - Cache invalidation after create/update/delete operations ensures real-time updates
- **Loading and Empty States**: 
  - Skeleton UI (5 animated pulse rows) displays during initial data fetch
  - Empty state message shown when no transactions exist: "No transactions found - Import data or add transactions to get started"
  - Proper loading indicators on mutation buttons (isPending state)
- **Google Sheets Integration Working**: 
  - Imported transactions automatically appear in dashboard without refresh
  - Test confirmed: 30 transactions imported from Google public example sheet
  - All status cards and tabs update dynamically with real counts
  - Transactions appear in correct tabs based on status (e.g., "pending-ledger" tab)
- **CRUD Operations**: Created mutations for creating, updating, and deleting transactions via API
  - Manual transaction entry via "New Transaction" button
  - Transaction updates trigger cache invalidation and UI refresh
  - Delete moves transactions to trash locally and removes from API

### Google Sheets Real Import Implementation (October 14, 2025)
- **OAuth Authentication**: Replit connector manages Google OAuth automatically
  - No API key required from users
  - Secure token management and automatic refresh handled by Replit
  - Frontend displays "OAuth authentication managed by Replit" message
- **Real Data Import**: System reads actual spreadsheet data from Google Sheets API
  - **Column Mapping** (Updated October 14, 2025):
    - Column A: Date (MM/DD/YYYY or YYYY-MM-DD format)
    - Column B: Value/Amount (numeric, $ and commas automatically removed)
    - Column D: Car (vehicle model/description) - optional
    - Column E: Client Name (customer/payment identifier) - required
    - Column F: Depositor Name (who made the deposit) - optional
  - Parses various date formats automatically
  - Handles currency formatting (removes $ and commas)
  - Creates transactions with status="pending-ledger" and source="Google Sheets"
  - Skips rows with missing required fields (date, value, or client name)
- **Connection Persistence**: Tracks last import date, record count, and spreadsheet URL
- **End-to-End Testing**: Confirmed working with Google's public example spreadsheet
  - Successfully imported 30 transactions
  - All transactions appeared in dashboard immediately
  - Status cards and tabs updated correctly

### English Localization (October 13, 2025)
- **Full System Translation**: Completed translation from Portuguese (pt-BR) to English (en-US)
  - All UI components, pages, and labels converted to English
  - Date formatting changed from dd/MM/yyyy to MM/dd/yyyy (US standard)
  - Currency formatting changed from Brazilian Real (BRL/R$) to US Dollar (USD/$)
  - Date-fns locale changed from pt-BR to en-US across all components
- **Components Translated**:
  - Dashboard, TransactionTable, TransactionSheet, AddTransactionDialog
  - TrashView, AppSidebar, Help page, Upload page
  - FileUploadZone, GoogleSheetsConnect, DateRangePicker
- **Business Context**: System now serves US-based car financing company

### Filter Confirmation System (October 13, 2025)
- **Implemented Two-Step Filter Workflow**: Users now select filters first, then explicitly apply them
  - Temporary filter state (`selectedDateRange`) separate from applied state (`appliedDateRange`)
  - "Apply Filters" button highlights with "!" badge when filters are pending
  - "Clear Filters" button appears when filters are active, allowing easy reset
- **Date Range Filtering**: Implemented using `isWithinInterval` from date-fns
  - Filters transactions between selected start and end dates
  - All status cards and tabs dynamically reflect filtered transaction counts
  - Semi-controlled DateRangePicker component with useEffect for state synchronization
- **UI/UX Improvements**: 
  - Visual feedback for pending filter changes
  - Clear affordance for applying and clearing filters
  - Consistent filtering across all dashboard views (tabs and cards)

### Transaction Data Model Updates (January 2025)
- **Added Car Field**: Transaction model now includes a dedicated `car` field (optional) to track which vehicle is associated with each payment
- **Separated Name and Car**: Previously combined description field is now split into:
  - `name`: Customer payment identifier (e.g., "Recebimento Parcela - João Silva")
  - `car`: Vehicle information (e.g., "Honda Civic 2020")
- **Business Context**: Supports car financing operations where payments need to be linked to specific financed vehicles

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
- Full English (en-US) localization with US date and currency formatting

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
- `date-fns`: Date manipulation and formatting (with en-US locale)
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