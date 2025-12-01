# Car Allocation Management SaaS - Design Guidelines

## Design Approach

**Selected Framework**: Material Design principles adapted for enterprise SaaS
**Reference Inspirations**: Linear (clean data displays), Vercel Dashboard (modern admin interfaces), Notion (clear hierarchy)

**Core Philosophy**: Prioritize clarity, efficiency, and mobile accessibility. Admin interface optimized for data density and quick actions; Driver view optimized for at-a-glance information and mobile use.

## Typography System

**Font Family**: Inter (Google Fonts) for all text
- Headings: 600-700 weight
- Body: 400-500 weight  
- Data/Numbers: 500 weight (tabular-nums for alignment)

**Scale**:
- Page titles: text-2xl to text-3xl
- Section headers: text-xl
- Card titles: text-lg
- Body text: text-base
- Labels/metadata: text-sm
- Captions: text-xs

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: gap-6 to gap-8
- Card margins: m-4 to m-6
- Page containers: max-w-7xl with px-4 to px-8

**Grid System**:
- Admin: 12-column grid for complex layouts
- Driver View: Single column, full-width cards

## Interface-Specific Layouts

### Admin Dashboard

**Structure**: Sidebar navigation (fixed, 240px width on desktop, collapsible on mobile) + main content area

**Main Content Zones**:
1. **Top Stats Bar**: 4-column grid (lg:grid-cols-4 md:grid-cols-2) showing: Total Vehicles, Available, Assigned, In Maintenance
2. **Action Header**: Flex row with page title + primary action buttons (right-aligned)
3. **Data Tables**: Full-width with alternating row styling, sticky headers
4. **Modal Forms**: Centered overlays (max-w-2xl) for add/edit operations

**Vehicle Inventory Table**:
- Columns: Status Badge, License Plate, Make/Model, Location, Assigned To, Actions
- Row height: py-4
- Compact view toggle for dense data display

**Assignment Interface**:
- Two-panel layout: Available Vehicles (left) + Driver Selection (right)
- Filter chips at top: Role-based, Location-based
- Drag-and-drop assignment cards (optional enhancement)

### Driver View

**Structure**: Mobile-first, no sidebar

**Current Assignment Card** (Hero Section):
- Full-width card with prominent vehicle details
- Large vehicle type icon or placeholder image
- Key info: License Plate (text-3xl), Make/Model, Assignment Date
- Primary CTA: "Report Issue" button (full-width on mobile)

**Assignment History**:
- Timeline/List view with date headers
- Collapsible past assignments
- Each item: Compact card with vehicle info + date range

## Component Library

### Cards
- Border radius: rounded-lg
- Shadow: shadow-sm, hover:shadow-md transition
- Padding: p-6
- Spacing between cards: gap-4

### Buttons
**Primary**: Solid fill, px-6 py-3, rounded-md, font-medium
**Secondary**: Border variant, same sizing
**Icon Buttons**: Square (w-10 h-10), rounded-md, centered icon

### Data Tables
- Sticky header with border-b-2
- Row padding: py-3 px-4
- Hover state on rows
- Sortable column headers with icon indicators
- Pagination controls at bottom (center-aligned)

### Status Badges
- Pill shape: rounded-full, px-3 py-1, text-sm font-medium
- States: Available, Assigned, Maintenance, Out of Service

### Forms
- Label above input pattern
- Input height: h-12
- Input padding: px-4
- Spacing between fields: space-y-4
- Helper text: text-sm, mt-1
- Required field indicator: asterisk in label

### Modals/Overlays
- Backdrop blur: backdrop-blur-sm
- Content max-width: max-w-2xl
- Padding: p-6
- Close button: top-right, absolute positioning

## Navigation

**Admin Sidebar**:
- Logo/brand at top (h-16)
- Nav items: py-3 px-4, rounded-md
- Active state: filled background
- Icons: 20px, left-aligned with text
- Sections: Dashboard, Vehicles, Drivers, Assignments, History

**Driver Mobile Header**:
- Fixed top bar (h-16)
- Logo + user menu (hamburger)
- Bottom tab navigation for multi-section apps

## Responsive Breakpoints

**Mobile** (< 768px):
- Single column layouts
- Stacked cards
- Full-width buttons
- Collapsible sidebar (drawer)
- Simplified tables (card view)

**Tablet** (768px - 1024px):
- 2-column grids where applicable
- Sidebar remains collapsible
- Tables show all columns

**Desktop** (> 1024px):
- Full sidebar visible
- Multi-column grids
- Maximum data density
- Hover interactions enabled

## Data Visualization

**Assignment History Log**:
- Tabular view with filters
- Date range picker
- Export functionality (top-right)
- Search bar (global, top-left)
- Columns: Driver Name, Vehicle, Start Date, End Date, Duration, Status

**Availability Dashboard**:
- Bar chart or donut chart for vehicle status distribution (optional)
- Real-time status indicators with pulse animation
- Location-based grouping with collapsible sections

## Images & Icons

**Icons**: Material Icons (CDN) - consistent 24px size throughout
**Vehicle Placeholders**: Use abstract vehicle type icons (sedan, SUV, truck) in absence of photos
**No hero images**: This is a utility application - focus on immediate functionality over marketing visuals

## Accessibility

- Form labels associated with inputs
- Error states with clear messaging
- Focus indicators on all interactive elements
- Keyboard navigation support
- ARIA labels for icon-only buttons
- Minimum touch target: 44px x 44px for mobile

## Micro-interactions (Minimal)

- Button hover: subtle scale or opacity change
- Card hover: elevation increase
- Loading states: spinner or skeleton screens
- Success/error toast notifications (top-right)
- Status badge pulse for "In Use" state

This design creates a professional, efficient SaaS interface optimized for fleet management workflows with clear separation between admin control and driver information access.