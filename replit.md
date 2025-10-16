# Conciliação Pro - Car Financing Reconciliation System

## Overview

Conciliação Pro is an enterprise-grade financial reconciliation application designed for car financing companies. It automates the matching of payment transactions (parcelas) across Google Sheets (ledger), bank statements, and credit card statements. The system verifies customer payments against accounting ledger entries, tracking customer and vehicle details, payment amounts, and reconciliation status. It provides a professional dashboard for financial data management, file uploads, reconciliation workflows, and transaction tracking, with both light and dark theme support. The project's ambition is to streamline financial operations for car financing, providing a clear overview of payment statuses and reducing manual reconciliation efforts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript (Vite).
**UI Component System**: shadcn/ui (Radix UI primitives) with Tailwind CSS, following Material Design 3 principles. Features a custom theme with CSS variables for light/dark modes, a professional color palette, and Inter font for readability.
**Routing**: wouter for lightweight client-side routing.
**State Management**: TanStack Query (React Query) for server state; local React state for UI interactions; custom theme context for light/dark mode.
**Key Design Patterns**: Component composition, separation of concerns, custom hooks, data-first hierarchy, full English (en-US) localization.
**Pages**: 
- `/` - Dashboard with overview cards and transaction summary
- `/transactions` - All transactions view with filtering, manual reconciliation filter for transactions with missing depositor info, date range filter for manual reconciliation (added Oct 2025)
- `/upload` - File upload for bank/card statements and Google Sheets connection
- `/settings` - Application settings
- `/help` - Help and documentation

### Backend Architecture

**Runtime**: Node.js with Express.
**Database**: PostgreSQL via Neon serverless with Drizzle ORM, utilizing WebSocket connections and Drizzle-kit for migrations.
**API Structure**: RESTful endpoints (`/api` prefix), with JSON parsing, request logging, and centralized error handling.
**Storage Layer**: Abstracted `IStorage` interface with an in-memory implementation (`MemStorage`) for development and a database-ready implementation for production.
**Authentication**: User-based system with username/password (pending full implementation).

### Core Reconciliation Algorithm

The system matches transactions based on:
1.  **Value matching**: Exact amount.
2.  **Date tolerance**: Configurable (default ±2 days).
3.  **Text similarity**: Analysis of descriptions/historical text with confidence scoring.

Transactions are categorized as:
-   **Reconciled**: Matched across ledger and statements.
-   **Pending Ledger**: Only in ledger (awaiting payment).
-   **Pending Statement**: Only in statements (unexpected transactions).

Specific reconciliation criteria for CSV bank statements with Google Sheets ledger data:
-   Date match with ±2 days tolerance.
-   Exact value/amount match.
-   Payment method must be "Zelle".
-   Customer/depositor name must match (CSV depositor vs. Sheet client/depositor).
-   Confidence score calculated based on date, value, Zelle, and name match.

**Manual Reconciliation**: 
- **Automatic Filter**: Identifies ~5,000+ transactions with missing depositor info that need manual attention
- **Date Range Filter**: Filter manual reconciliation transactions by date range (From/To dates) with local timezone support
- **Visual Highlighting**: Orange background and "Empty" text for transactions missing depositor field
- **Interactive**: When automatic matching fails (e.g., partial name matches like "John Smith" vs "John Smth"), users can manually reconcile via Link2 icon button. System shows candidate matches with opposite status (pending-ledger ↔ pending-statement), allows selection, and updates both to "reconciled" with 100% confidence. Backend validates complementary statuses and prevents self-reconciliation.

**Reconciliation Verification (Oct 16, 2025)**:
- **View Reconciliation Details**: Eye icon button appears on reconciled transactions, opening a dialog that displays both matched transactions side-by-side
- **Comparison Dialog**: Shows original transaction (ledger/statement) and matched transaction with Date, Name/Depositor, Car, Amount, and Payment Method
- **Source Identification**: Clearly labels transaction source (Google Sheets, Bank Statement CSV/OFX)
- **Match Validation**: Visual indicator shows if amounts match exactly, helping verify reconciliation accuracy
- **Confidence Display**: Shows reconciliation confidence percentage (100% for manual matches)
- **Backend Support**: GET `/api/transactions/:id/match` endpoint retrieves paired transactions via `matchedTransactionId` field

### Data Import Pipeline

**Supported Formats**: OFX and CSV for bank/card statements; Google Sheets API for ledger spreadsheets.
**Upload Flow**: Drag-and-drop/selection, client-side validation, server-side parsing and normalization, storage with source tracking, and automatic reconciliation trigger.
**Google Sheets Integration**: 
- OAuth authentication managed by Replit
- Column mapping for Date (A), Value (B), Car (D), Client Name (E), Depositor Name (F), Payment Method (G)
- **Date Parsing (Oct 15, 2025)**: Dates parsed as UTC at noon (12:00) to prevent timezone shift issues where day 15 would appear as day 14
- Handles date/currency parsing and skips invalid rows
- Uses batchGet with 3 ranges to fetch up to 15,000 rows efficiently
- **Performance Optimization (Oct 2025)**: Batch insert in chunks of 1,000 transactions to bypass PostgreSQL parameter limits
- Import times: ~3.5s for first import of 9,505 transactions, ~1.7s for incremental imports
- Incremental import using Set-based O(1) duplicate detection with unique key: `date|value|name|depositor`
- **Row Order Preservation (Oct 15, 2025)**: Each transaction stores its original spreadsheet row number (`sheetOrder` field)
- **Display Order (Oct 15, 2025)**: Transactions are ordered by reconciliation status (reconciled → pending-ledger → pending-statement), then by **reverse** spreadsheet row order within each status group (most recent entries first, last row of spreadsheet appears at top)
- **Payment Method Matching (Oct 16, 2025)**: Column G specifies payment method for intelligent reconciliation:
  - "Credit Card" transactions reconcile only with Stripe uploads
  - "Zelle"/"Deposit" transactions reconcile only with Wells Fargo CSV uploads
  - Source prefixing ensures reliable matching regardless of filename

### Configuration Management

**Environment Variables**: `DATABASE_URL`, `NODE_ENV`.
**Build Configuration**: Path aliases, separate client/server builds, development server with file system restrictions.
**Theme Customization**: CSS custom properties, Tailwind configuration, light/dark mode.

## External Dependencies

**Third-Party Services**:
-   Google Sheets API for ledger synchronization.
-   Google Fonts CDN for Inter typography.
-   Neon serverless PostgreSQL for database hosting.

**Key NPM Packages**:
-   `@neondatabase/serverless`: Serverless Postgres client.
-   `drizzle-orm`: TypeScript ORM.
-   `@tanstack/react-query`: Data fetching and caching.
-   `@radix-ui/*`: Accessible UI primitives.
-   `date-fns`: Date manipulation and formatting (en-US locale).
-   `react-day-picker`: Calendar and date range selection.
-   `wouter`: Lightweight routing.
-   `tailwindcss`: Utility-first CSS framework.
-   `zod`: Runtime type validation.