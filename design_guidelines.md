# Conciliação Pro - Design Guidelines

## Design Approach: Enterprise Financial Dashboard

**Selected Approach**: Design System-Based (Material Design 3 + Fintech Dashboard Patterns)
**Rationale**: Financial reconciliation requires data clarity, trust signals, and efficient workflows. Drawing from modern fintech platforms like Stripe Dashboard, QuickBooks, and Plaid for professional credibility.

**Core Principles**:
- Data-first hierarchy: Information clarity over decorative elements
- Trust through consistency: Reliable patterns for financial data
- Efficient workflows: Minimize clicks, maximize insight
- Professional polish: Clean, authoritative visual language

---

## Color Palette

### Light Mode
- **Primary**: 214 100% 45% (Professional blue - trust and stability)
- **Success**: 142 76% 36% (Reconciled transactions)
- **Warning**: 38 92% 50% (Pending items requiring attention)
- **Error**: 0 84% 60% (Discrepancies, missing entries)
- **Background**: 0 0% 100% (Pure white for data clarity)
- **Surface**: 214 20% 97% (Subtle card backgrounds)
- **Border**: 214 15% 88% (Soft separation)
- **Text Primary**: 222 47% 11% (High contrast for numbers)
- **Text Secondary**: 215 16% 47% (Supporting information)

### Dark Mode
- **Primary**: 214 100% 60%
- **Success**: 142 70% 45%
- **Warning**: 38 90% 55%
- **Error**: 0 80% 65%
- **Background**: 222 47% 7%
- **Surface**: 217 33% 12%
- **Border**: 217 20% 20%
- **Text Primary**: 0 0% 98%
- **Text Secondary**: 215 15% 70%

---

## Typography

**Font Stack**: Inter (via Google Fonts CDN) for exceptional readability in financial data

- **Display (Dashboard Headers)**: 32px / 600 / -0.02em
- **H1 (Section Titles)**: 24px / 600 / -0.01em  
- **H2 (Card Headers)**: 18px / 600 / normal
- **Body (Data Tables)**: 14px / 400 / normal
- **Caption (Metadata)**: 12px / 400 / 0.01em
- **Numbers (Financials)**: 14px / 500 / tabular-nums (monospaced digits)

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm

**Grid Structure**:
- Dashboard: 12-column grid with 16px gutters
- Cards: 8px padding on mobile, 16px on tablet, 24px on desktop
- Tables: 12px row padding, 16px cell padding
- Page margins: 16px mobile, 24px tablet, 32px desktop

**Breakpoints**:
- Mobile: < 640px (single column)
- Tablet: 640-1024px (2-column dashboard)
- Desktop: > 1024px (3-column dashboard + sidebar)

---

## Component Library

### Navigation
- **Top Bar**: Fixed header (h-16) with logo, account selector, user profile, theme toggle
- **Sidebar** (Desktop only): w-64, collapsible to w-16, navigation items with icons from Heroicons
- **Tab Navigation**: For switching between Reconciled/Pending views, underline indicator

### Data Display

**Transaction Tables**:
- Sticky header row with sortable columns
- Alternating row backgrounds (subtle: surface color every other row)
- Status badges: pill-shaped (rounded-full), color-coded (success/warning/error)
- Hover state: slight background lift on rows
- Selection: checkbox column for bulk actions

**Status Cards**:
- Three primary metric cards (Reconciled / Pending Ledger / Pending Statement)
- Large number (32px), label below (14px), trend indicator (optional)
- Icon on left (Heroicons: CheckCircle, Clock, AlertCircle)

**Reconciliation Panel**:
- Split view: Source transaction (left) | Matched transaction (right)
- Confidence score indicator (0-100%, shown as progress bar)
- Manual match controls: "Confirm Match" (primary) / "Reject" (outline) buttons

### Forms & Inputs

**File Upload**:
- Drag-and-drop zone: dashed border-2, min-h-32
- File type badges showing .OFX, .CSV support
- Upload progress bar with percentage

**Date Range Picker**:
- Dual input fields with calendar icon
- Preset ranges: "Last 7 days", "This month", "Last 30 days", "Custom"

**Search & Filters**:
- Global search: min-w-64, with search icon (Heroicons: MagnifyingGlass)
- Filter chips: removable (X icon), grouped by category

### Modals & Overlays

**Connection Modal** (Google Sheets/Drive):
- Centered, max-w-lg, dark overlay (bg-black/50)
- Clear steps indicator (1. Authorize → 2. Select Sheet → 3. Configure)

**Manual Match Dialog**:
- Side panel (slides from right), w-96
- Transaction details comparison with highlighted differences
- Action buttons fixed at bottom

---

## Images

**Dashboard Background** (Optional Accent):
- Subtle abstract financial chart pattern in primary color (5% opacity)
- Applied to main dashboard background as texture, not dominating content

**Empty States**:
- Illustration for "No Reconciliations Yet" - minimalist line art of documents/checkmarks
- Illustration for "Upload Files" - cloud upload graphic with file icons

**No large hero image** - This is a utility dashboard, not a marketing page. Focus is immediate data access.

---

## Animations

**Minimal, Purpose-Driven Only**:
- Reconciliation success: subtle checkmark fade-in (300ms)
- Table sorting: 200ms opacity transition
- Modal entry: 250ms slide-in from bottom
- NO decorative animations on dashboard load

---

## Accessibility & Quality Standards

- WCAG AAA contrast ratios for all financial data (numbers, status text)
- Keyboard navigation: Tab through all interactive elements, Enter to trigger
- Screen reader labels on all status badges and icons
- Dark mode: All form inputs maintain consistent styling with proper contrast
- Loading states: Skeleton screens for table rows during data fetch
- Error states: Clear, actionable error messages with retry options

---

## Key Visual Patterns

**Dashboard Layout** (Desktop):
1. Top bar: Logo | Account Dropdown | Period Selector | User Menu
2. Sidebar: Dashboard, Upload Files, Settings, Help
3. Main content: Status cards (3-column) → Tabs (Reconciled/Pending) → Data Table
4. Side panel (when active): Transaction details or manual match interface

**Reconciliation Visual Language**:
- Green checkmark badges for matched items
- Yellow clock icons for pending items  
- Red alert icons for discrepancies
- Connecting lines (dotted) between matched source/target in detail view

**Data Density**: Tables show 15-20 rows per page with pagination, balancing information density with readability. Numbers align right, text left, status badges center-aligned.