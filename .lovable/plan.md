

# Motion Project Color Guideline Refactor (v3 - Final + 6 Fixes)
## Monochrome + Minimal Semantic Design System

---

## Final Fixes Applied

| Fix | Issue | Resolution |
|-----|-------|------------|
| 1 | `.dark` outside `@layer base` | Both `:root` and `.dark` inside `@layer base {}` |
| 2 | `--sidebar-ring` brighter than brand | Set to `220 55% 46%` in `:root` (match `--primary`) |
| 3 | Badge semantic text contrast risk | Use `text-foreground` with `[&>svg]:text-*` for icons |
| 4 | EventCard duplicated hashing | Use `getClientColorIndex()` single source of truth |
| 5 | Clients.tsx green buttons | Strict rule: `bg-primary` for actions, badge for states |
| 6 | WCAG risk items | Documented with fallback knobs if checks fail |

---

## Phase 1: CSS Design Tokens (`src/index.css`)

### Complete Structure (Both Blocks Inside `@layer base`)

```css
@layer base {
  :root {
    /* Typography — font family */
    --font-sans: "Montserrat", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

    /* Typography base */
    --fs-xs: 12px;
    --fs-sm: 14px;
    --fs-base: 16px;
    --fs-md: 18px;
    --fs-lg: 20px;
    --fs-h6: 24px;
    --fs-h5: 28px;
    --fs-h4: 32px;
    --fs-h3: 36px;
    --fs-h2: 40px;
    --fs-h1: 44px;

    --lh-tight: 1.2;
    --lh-snug: 1.3;
    --lh-normal: 1.5;
    --lh-relaxed: 1.6;

    /* Spacing (4-point system) */
    --space-0: 0px;
    --space-2: 2px;
    --space-4: 4px;
    --space-8: 8px;
    --space-12: 12px;
    --space-16: 16px;
    --space-20: 20px;
    --space-24: 24px;
    --space-28: 28px;
    --space-32: 32px;
    --space-40: 40px;
    --space-48: 48px;
    --space-56: 56px;
    --space-64: 64px;
    --space-80: 80px;
    --space-96: 96px;

    /* Radius & shadows */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.10);

    /* Containers */
    --container-2xl: 1440px;

    /* Interaction */
    --hit-min: 44px;

    /* === MONOCHROME NEUTRALS === */
    --ink-900: 220 15% 8%;
    --ink-800: 220 12% 14%;
    --ink-700: 220 10% 22%;
    --ink-600: 220 9% 32%;
    --ink-500: 220 8% 45%;
    --ink-300: 220 8% 70%;
    --ink-200: 220 8% 92%;
    --paper-0: 0 0% 100%;
    --paper-98: 0 0% 98%;

    /* === CORE SURFACES === */
    --background: 0 0% 98%;
    --foreground: 220 15% 8%;

    --card: 0 0% 100%;
    --card-foreground: 220 15% 8%;

    --popover: 0 0% 100%;
    --popover-foreground: 220 15% 8%;

    /* === PRIMARY (BRAND ACCENT - BLUE) === */
    --primary: 220 55% 46%;
    --primary-foreground: 0 0% 100%;
    --primary-hover: 220 55% 40%;

    /* === SECONDARY === */
    --secondary: 0 0% 100%;
    --secondary-foreground: 220 15% 8%;

    /* === MUTED === */
    --muted: 220 8% 92%;
    --muted-foreground: 220 8% 45%;

    /* === ACCENT (NOW NEUTRAL, NOT GREEN) === */
    --accent: 220 8% 92%;
    --accent-foreground: 220 15% 8%;
    --accent-hover: 220 8% 88%;

    /* === DESTRUCTIVE === */
    --destructive: 0 65% 48%;
    --destructive-foreground: 0 0% 100%;

    /* === SEMANTIC: SUCCESS === */
    --success: 145 45% 42%;
    --success-foreground: 0 0% 100%;
    --success-ring: 145 45% 42%;

    /* === SEMANTIC: WARNING === */
    --warning: 38 90% 50%;
    --warning-foreground: 0 0% 100%;
    --warning-ring: 38 90% 50%;

    /* === SEMANTIC: DANGER RING === */
    --danger-ring: 0 65% 48%;

    /* === BORDERS & INPUTS === */
    --border: 220 8% 92%;
    --input: 220 8% 92%;
    --ring: 220 55% 46%;

    --radius: 1rem;

    /* === SIDEBAR (DARK IN LIGHT MODE) === */
    --sidebar-background: 220 15% 8%;
    --sidebar-foreground: 0 0% 92%;
    --sidebar-muted: 220 8% 70%;
    --sidebar-hover: 220 12% 14%;
    --sidebar-active: 220 10% 22%;
    --sidebar-border: 220 12% 14%;
    --sidebar-accent: 220 10% 22%;
    --sidebar-accent-foreground: 0 0% 92%;
    /* FIX #2: Match brand ring (was 54%, now 46%) */
    --sidebar-ring: 220 55% 46%;

    /* === CLIENT COLORS (CALENDAR EVENTS) === */
    --client-1: 226 80% 52%;
    --client-2: 171 65% 38%;
    --client-3: 16 78% 50%;
    --client-4: 280 60% 55%;
    --client-5: 197 70% 42%;
    --client-6: 340 65% 50%;
    --client-7: 40 85% 50%;
    --client-8: 120 45% 40%;
  }

  /* FIX #1: .dark INSIDE @layer base */
  .dark {
    /* Monochrome Neutrals */
    --ink-900: 220 15% 8%;
    --ink-800: 220 12% 14%;
    --ink-700: 220 10% 22%;
    --ink-600: 220 9% 32%;
    --ink-500: 220 8% 45%;
    --ink-300: 220 8% 70%;
    --ink-200: 220 8% 92%;
    --paper-0: 0 0% 100%;
    --paper-98: 0 0% 98%;

    /* Semantic Colors (brighter for dark mode) */
    --success: 145 45% 52%;
    --success-foreground: 0 0% 100%;
    --success-ring: 145 45% 52%;

    --warning: 38 85% 58%;
    --warning-foreground: 0 0% 100%;
    --warning-ring: 38 85% 58%;

    --danger-ring: 0 65% 55%;

    /* Core surfaces */
    --background: 220 15% 8%;
    --foreground: 0 0% 92%;

    --card: 220 12% 14%;
    --card-foreground: 0 0% 92%;

    --popover: 220 12% 14%;
    --popover-foreground: 0 0% 92%;

    /* Primary */
    --primary: 220 55% 54%;
    --primary-foreground: 0 0% 100%;
    --primary-hover: 220 55% 48%;

    /* Secondary */
    --secondary: 220 10% 22%;
    --secondary-foreground: 0 0% 92%;

    /* Muted (different from card for hover visibility) */
    --muted: 220 12% 18%;
    --muted-foreground: 220 8% 70%;

    /* Accent (neutral) */
    --accent: 220 10% 22%;
    --accent-foreground: 0 0% 92%;
    --accent-hover: 220 10% 26%;

    /* Destructive */
    --destructive: 0 65% 55%;
    --destructive-foreground: 0 0% 100%;

    /* Borders & inputs */
    --border: 220 10% 22%;
    --input: 220 10% 22%;
    --ring: 220 55% 54%;

    /* Sidebar */
    --sidebar-background: 220 15% 6%;
    --sidebar-foreground: 0 0% 92%;
    --sidebar-muted: 220 8% 70%;
    --sidebar-hover: 220 12% 14%;
    --sidebar-active: 220 10% 22%;
    --sidebar-border: 220 10% 22%;
    --sidebar-accent: 220 10% 22%;
    --sidebar-accent-foreground: 0 0% 92%;
    --sidebar-ring: 220 55% 54%;

    /* Client colors (brighter for dark mode) */
    --client-1: 226 75% 60%;
    --client-2: 171 60% 45%;
    --client-3: 16 75% 58%;
    --client-4: 280 55% 62%;
    --client-5: 197 65% 50%;
    --client-6: 340 60% 58%;
    --client-7: 40 80% 58%;
    --client-8: 120 40% 48%;
  }

  /* Responsive type tweaks */
  @media (max-width: 639px) {
    :root {
      --fs-h1: 32px;
      --fs-h2: 28px;
      --fs-h3: 24px;
      --fs-h4: 22px;
      --fs-h5: 20px;
      --fs-h6: 18px;
    }
  }

  @media (min-width: 1024px) {
    :root {
      --fs-h1: 44px;
      --fs-h2: 40px;
      --fs-h3: 36px;
      --fs-h4: 32px;
      --fs-h5: 28px;
      --fs-h6: 24px;
    }
  }
}
```

### Focus-Visible CSS (After `@layer base`)

```css
@layer base {
  /* ... tokens above ... */

  html {
    font-size: 100%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
    font-size: var(--fs-base);
    line-height: var(--lh-normal);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Headings remain unchanged */
}

/* Global focus-visible ring (box-shadow mimics ring-2 ring-offset-2) */
:where(a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])):focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--background)),
    0 0 0 4px hsl(var(--ring));
}

/* Sidebar-specific focus (dark background needs matching offset) */
[data-sidebar="root"] :where(a, button, [role="button"], [tabindex]:not([tabindex="-1"])):focus-visible {
  box-shadow:
    0 0 0 2px hsl(var(--sidebar-background)),
    0 0 0 4px hsl(var(--sidebar-ring));
}
```

---

## Phase 2: Tailwind Configuration (`tailwind.config.ts`)

### Colors Object Update

```typescript
colors: {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
    hover: "hsl(var(--primary-hover))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
    hover: "hsl(var(--accent-hover))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  // NEW: Semantic colors
  success: {
    DEFAULT: "hsl(var(--success))",
    foreground: "hsl(var(--success-foreground))",
  },
  warning: {
    DEFAULT: "hsl(var(--warning))",
    foreground: "hsl(var(--warning-foreground))",
  },
  // NEW: Ink scale (CSS variable references)
  ink: {
    900: "hsl(var(--ink-900))",
    800: "hsl(var(--ink-800))",
    700: "hsl(var(--ink-700))",
    600: "hsl(var(--ink-600))",
    500: "hsl(var(--ink-500))",
    300: "hsl(var(--ink-300))",
    200: "hsl(var(--ink-200))",
  },
  paper: {
    0: "hsl(var(--paper-0))",
    98: "hsl(var(--paper-98))",
  },
  // Sidebar (NO sidebar-primary — use primary directly)
  sidebar: {
    DEFAULT: "hsl(var(--sidebar-background))",
    foreground: "hsl(var(--sidebar-foreground))",
    muted: "hsl(var(--sidebar-muted))",
    hover: "hsl(var(--sidebar-hover))",
    active: "hsl(var(--sidebar-active))",
    accent: "hsl(var(--sidebar-accent))",
    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
    border: "hsl(var(--sidebar-border))",
    ring: "hsl(var(--sidebar-ring))",
  },
  // Client colors (keep existing)
  "client-1": "hsl(var(--client-1))",
  "client-2": "hsl(var(--client-2))",
  "client-3": "hsl(var(--client-3))",
  "client-4": "hsl(var(--client-4))",
  "client-5": "hsl(var(--client-5))",
  "client-6": "hsl(var(--client-6))",
  "client-7": "hsl(var(--client-7))",
  "client-8": "hsl(var(--client-8))",
}
```

---

## Phase 3: Component Updates

### 3.1 Client Color Utility (`src/utils/clientColor.ts`)

Add `getClientColorIndex` function (single source of truth for hashing):

```typescript
/**
 * Returns a color index (1-8) for a given client ID.
 * Used for CSS variable reference: --client-${index}
 */
export function getClientColorIndex(clientId: string): number {
  let h = 0;
  for (let i = 0; i < clientId.length; i++) {
    h = (h * 31 + clientId.charCodeAt(i)) >>> 0;
  }
  return (h % 8) + 1;
}

const TOKENS = [
  { bg: "bg-client-1", text: "text-white", ring: "ring-client-1", dot: "bg-client-1", border: "border-l-client-1" },
  { bg: "bg-client-2", text: "text-white", ring: "ring-client-2", dot: "bg-client-2", border: "border-l-client-2" },
  { bg: "bg-client-3", text: "text-white", ring: "ring-client-3", dot: "bg-client-3", border: "border-l-client-3" },
  { bg: "bg-client-4", text: "text-white", ring: "ring-client-4", dot: "bg-client-4", border: "border-l-client-4" },
  { bg: "bg-client-5", text: "text-white", ring: "ring-client-5", dot: "bg-client-5", border: "border-l-client-5" },
  { bg: "bg-client-6", text: "text-white", ring: "ring-client-6", dot: "bg-client-6", border: "border-l-client-6" },
  { bg: "bg-client-7", text: "text-white", ring: "ring-client-7", dot: "bg-client-7", border: "border-l-client-7" },
  { bg: "bg-client-8", text: "text-white", ring: "ring-client-8", dot: "bg-client-8", border: "border-l-client-8" },
];

export function colorClassesForClient(clientId: string) {
  const index = getClientColorIndex(clientId) - 1; // 0-based for array
  return TOKENS[index];
}
```

### 3.2 AppSidebar (`src/components/AppSidebar.tsx`)

```diff
// Add data-sidebar attribute for focus selector
<aside
+ data-sidebar="root"
  className={cn(
-   "sticky top-0 h-screen shrink-0 bg-muted flex flex-col...",
+   "sticky top-0 h-screen shrink-0 bg-sidebar text-sidebar-foreground flex flex-col...",
    collapsed ? "w-16" : "w-[232px]"
  )}
>

// Active/inactive states use sidebar tokens
- active
-   ? "bg-primary/15 text-primary font-semibold hover:bg-primary/18"
-   : "text-muted-foreground hover:bg-foreground/14 hover:text-foreground"
+ active
+   ? "bg-sidebar-active text-sidebar-foreground font-semibold"
+   : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"

// Active indicator uses --primary directly (bg-primary)
- <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[28px] rounded-full bg-primary/80" />
+ <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[28px] bg-primary" />
```

### 3.3 Badge Component (`src/components/ui/badge.tsx`)

FIX #3: Use `text-foreground` with icon-only coloring for better contrast:

```typescript
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // DEFAULT is monochrome
        default: "border-transparent bg-muted text-foreground",
        secondary: "border-transparent bg-muted text-foreground",
        outline: "border-border text-foreground bg-transparent",
        destructive: "bg-destructive/10 text-foreground border border-destructive/40 [&>svg]:text-destructive",
        // FIX #3: Semantic variants use neutral text, icon gets color
        success: "bg-success/10 text-foreground border border-success/40 [&>svg]:text-success",
        warning: "bg-warning/12 text-foreground border border-warning/40 [&>svg]:text-warning",
        danger: "bg-destructive/10 text-foreground border border-destructive/40 [&>svg]:text-destructive",
        // Optional brand badge (use sparingly)
        brand: "border-transparent bg-primary text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
```

### 3.4 Alert Component (`src/components/ui/alert.tsx`)

```typescript
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-card text-foreground border-border [&>svg]:text-foreground",
        destructive: "border-l-4 border-l-destructive bg-destructive/10 text-foreground [&>svg]:text-destructive dark:bg-destructive/14",
        success: "border-l-4 border-l-success bg-success/10 text-foreground [&>svg]:text-success dark:bg-success/16",
        warning: "border-l-4 border-l-warning bg-warning/12 text-foreground [&>svg]:text-warning dark:bg-warning/18",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
```

### 3.5 Sonner Toast (`src/components/ui/sonner.tsx`)

```typescript
toastOptions={{
  classNames: {
    toast:
      "group toast group-[.toaster]:font-sans group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-md",
    description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
    actionButton:
      "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-sm group-[.toast]:font-medium",
    cancelButton:
      "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-sm",
    success:
      "group-[.toaster]:border-l-4 group-[.toaster]:border-l-success group-[.toaster]:bg-success/10 dark:group-[.toaster]:bg-success/16",
    error:
      "group-[.toaster]:border-l-4 group-[.toaster]:border-l-destructive group-[.toaster]:bg-destructive/10 dark:group-[.toaster]:bg-destructive/14",
    info:
      "group-[.toaster]:border-l-4 group-[.toaster]:border-l-primary group-[.toaster]:bg-primary/10",
    warning:
      "group-[.toaster]:border-l-4 group-[.toaster]:border-l-warning group-[.toaster]:bg-warning/12 dark:group-[.toaster]:bg-warning/18",
  },
}}
```

### 3.6 Button Component (`src/components/ui/button.tsx`)

```diff
- outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
+ outline: "border border-input bg-background hover:bg-muted hover:text-foreground",

- ghost: "hover:bg-accent hover:text-accent-foreground",
+ ghost: "hover:bg-muted hover:text-foreground",
```

---

## Phase 4: Calendar Event Styling

### 4.1 EventCard (`src/features/events/components/EventCard.tsx`)

FIX #4: Use `getClientColorIndex()` instead of duplicated hashing:

```typescript
import { formatTimeRange } from "../utils/calendar-utils";
import { getClientColorIndex } from "@/utils/clientColor";
import { cn } from "@/lib/utils";
import type { EventWithClient } from "../types";

interface EventCardProps {
  event: EventWithClient;
  onClick: () => void;
  compact?: boolean;
  positioning?: {
    top: number;
    height: number;
    leftPercent: number;
    widthPercent: number;
  };
}

export function EventCard({ event, onClick, compact = false, positioning }: EventCardProps) {
  // FIX #4: Single source of truth for color index
  const colorIndex = event.coach_client_id 
    ? getClientColorIndex(event.coach_client_id) 
    : 1;

  const baseClasses = cn(
    "rounded-md p-2 cursor-pointer transition-all shadow-sm",
    "bg-muted text-foreground border-l-4",
    // Scale only in list view, not in dense calendar
    !positioning && "hover:shadow-md hover:scale-[1.02]",
    positioning && "hover:shadow-md",
    compact && "text-xs py-1 px-2"
  );

  const style: React.CSSProperties = positioning ? {
    position: 'absolute',
    top: positioning.top,
    height: Math.max(24, positioning.height),
    left: `${positioning.leftPercent * 100}%`,
    width: `${positioning.widthPercent * 100}%`,
    borderLeftColor: `hsl(var(--client-${colorIndex}))`,
  } : {
    borderLeftColor: `hsl(var(--client-${colorIndex}))`,
  };

  return (
    <div
      onClick={onClick}
      style={style}
      className={baseClasses}
      role="button"
      aria-label={`${event.title}${event.client_name ? ` with ${event.client_name}` : ''}`}
    >
      <div className="font-semibold truncate text-xs">{event.title}</div>
      <div className="text-[11px] text-muted-foreground truncate">{event.client_name}</div>
      {!compact && !positioning && (
        <div className="text-[11px] text-muted-foreground mt-1">
          {formatTimeRange(event.start_at, event.end_at, event.is_all_day)}
        </div>
      )}
    </div>
  );
}
```

### 4.2 BookingRequestCard (`src/features/bookings/components/BookingRequestCard.tsx`)

Same pattern with `getClientColorIndex()`:

```typescript
import { getClientColorIndex } from "@/utils/clientColor";

// In component:
const colorIndex = request.coach_client_id 
  ? getClientColorIndex(request.coach_client_id) 
  : 1;

// Style with borderLeftColor: `hsl(var(--client-${colorIndex}))`
```

---

## Phase 5: Hardcoded Color Cleanup

### FIX #5: Strict Rules for Green Button Migration

**Rule**: Any green button in UI must become:
- `bg-primary` if it is a **primary action**
- `bg-success` **only** if it is a "Confirm success / Completed" action in a safety workflow (rare)
- Otherwise: monochrome button (secondary/outline)

**State indicators**: For "Invite sent", "Saved", "Connected" states → **use success badge/callout**, not a success button.

### Files to Update

| File | Current | Change To |
|------|---------|-----------|
| `ActivityStatusBadge.tsx` | `bg-green-50 text-green-700` | `<Badge variant="success">` |
| `ActivityStatusBadge.tsx` | `bg-yellow-50 text-yellow-700` | `<Badge variant="warning">` |
| `ActivityStatusBadge.tsx` | `bg-red-50 text-red-700` | `<Badge variant="danger">` |
| `PackageStatusBadge.tsx` | `bg-green-50 text-green-700` | `<Badge variant="success">` |
| `PackageStatusBadge.tsx` | `bg-yellow-50 text-yellow-700` | `<Badge variant="warning">` |
| `PackageStatusBadge.tsx` | `bg-red-50 text-red-700` | `<Badge variant="danger">` |
| `AppointmentStatusBadge.tsx` | `bg-green-50 text-green-700` | `<Badge variant="success">` |
| `AppointmentStatusBadge.tsx` | `bg-yellow-50 text-yellow-700` | `<Badge variant="warning">` |
| `PlanEditorSaveBar.tsx` | `text-green-500` | `text-success` |
| `PasswordValidationChecklist.tsx` | `text-green-600` | `text-success` |
| `EventEditorModal.tsx` | `border-yellow-500 bg-yellow-50` | `<Alert variant="warning">` |
| `ClientInviteSection.tsx` | Multiple green/yellow/red | Semantic tokens |
| `OutOfOfficeManager.tsx` | `border-red-500 text-red-500` | `border-destructive text-destructive` |
| `Clients.tsx` | `bg-green-600` buttons | `bg-primary` (action) or `<Badge variant="success">` (state) |
| `AvailableSlotsOverlay.tsx` | `bg-green-500/10` | `bg-success/10 border-success/30` |

---

## Phase 6: WCAG Verification (FIX #6)

### Required Checks Before Ship

| Check | Requirement | Fallback Knob |
|-------|-------------|---------------|
| Primary button text | ≥ 4.5:1 | White on `hsl(220 55% 46%)` should pass |
| Muted-foreground on paper-98 | ≥ 4.5:1 | If fails: bump to `220 9% 40%` |
| Muted-foreground on card | ≥ 4.5:1 | Same adjustment if needed |
| Sidebar foreground on ink-900 | ≥ 4.5:1 | `hsl(0 0% 92%)` on `hsl(220 15% 8%)` should pass |
| Success icon on success/10 | ≥ 3:1 (graphical) | Should pass |
| Warning icon on warning/12 | ≥ 3:1 (graphical) | Should pass |

### Risk Items (Document for QA)

1. **`muted-foreground` on `paper-98`**: `220 8% 45%` on `0 0% 98%` is borderline. If it fails WCAG, adjust to `220 9% 40%`

2. **`text-warning` on `bg-warning/10`**: This was changed to `text-foreground` in badges (Fix #3) to avoid contrast issues. Alert/toast icons use `text-warning` which is acceptable for graphical elements.

---

## Files to Modify (Complete List)

| Category | File | Changes |
|----------|------|---------|
| **Core Theme** | `src/index.css` | Full token overhaul + `.dark` inside `@layer base` + focus-visible CSS |
| **Tailwind** | `tailwind.config.ts` | Add semantic colors + ink scale, remove sidebar-primary |
| **Utility** | `src/utils/clientColor.ts` | Add `getClientColorIndex()` function |
| **Sidebar** | `src/components/AppSidebar.tsx` | Add `data-sidebar="root"`, dark surface, border-l indicator |
| **Badge** | `src/components/ui/badge.tsx` | Monochrome default + semantic variants with neutral text |
| **Alert** | `src/components/ui/alert.tsx` | Add semantic variants |
| **Toast** | `src/components/ui/sonner.tsx` | Semantic tokens + dark mode opacities |
| **Button** | `src/components/ui/button.tsx` | Neutral hover states |
| **Calendar** | `src/features/events/components/EventCard.tsx` | Border-left + `getClientColorIndex()` |
| **Calendar** | `src/features/bookings/components/BookingRequestCard.tsx` | Border-left + defensive null check |
| **Status Badges** | 3 files | Migrate to semantic badge variants |
| **Forms** | `OutOfOfficeManager.tsx` | Destructive tokens |
| **Misc** | 8 additional files | Green/yellow/red → semantic tokens |

---

## Final Visual Acceptance Criteria

### Global
- [ ] No `bg-green-*` / `bg-yellow-*` / `bg-red-*` in codebase (except 3rd party)
- [ ] Accent (blue) appears only on: primary CTA, selected state, links, focus rings

### Focus Ring
- [ ] Focus ring visible on **buttons, links, inputs, calendar events, sidebar nav**, and **custom clickable divs** with `role="button"`

### Sidebar
- [ ] Light mode sidebar background is near-black (ink-900)
- [ ] Sidebar focus ring uses **same hue** as primary (not brighter in light mode)
- [ ] Inactive items: `text-sidebar-muted`
- [ ] Hover: `bg-sidebar-hover` + `text-sidebar-foreground`
- [ ] Active: `bg-sidebar-active` + 2px left bar `bg-primary`

### Forms
- [ ] Focus ring always visible (box-shadow approach)
- [ ] Error fields use danger ring (not blue)
- [ ] Warning fields use warning ring

### Calendar
- [ ] Events are neutral blocks (`bg-muted`)
- [ ] Client differentiation via left border color only
- [ ] In day view with **overlapping events**, hover does not reflow or overlap labels (no scale)

### Toasts / Alerts
- [ ] Success/warning/danger appear as subtle tints + border-left
- [ ] Dark mode tints: success ~0.16, warning ~0.18, danger ~0.14-0.16

### Semantic Usage
- [ ] Success/Warning backgrounds only appear as **tints** in alerts/toasts/badges; never as large section fills

---

## Anti-Pattern Rules (Code Review Enforcement)

**Never use these classes:**
- `text-green-*`, `bg-green-*`, `border-green-*` → use `text-success`, `bg-success/*`
- `text-yellow-*`, `bg-yellow-*`, `border-yellow-*` → use `text-warning`, `bg-warning/*`
- `text-red-*`, `bg-red-*`, `border-red-*` → use `text-destructive`, `bg-destructive/*`
- `text-amber-*`, `bg-amber-*` → use `text-warning`, `bg-warning/*`

**Semantic color only when:**
- Success: confirmed success states (completed, verified, saved)
- Warning: caution/penalty/late/cancellation risk
- Danger: destructive actions and errors

**Every semantic usage must have:**
- Matching icon (✓, ⚠, ✕)
- Label text (never color-only)

