

# Motion — New Color Palette Implementation (AUTHORITATIVE)
## Global Color Palette Replacement with Execution Mandate

---

## EXECUTION DIRECTIVE (READ FIRST)

This task is a **GLOBAL COLOR PALETTE REPLACEMENT**.

The palette defined in this document is the **new canonical source of truth**.

### This means:

- **Every existing UI surface, component, page, and state** must visually update to the new palette — even if it already "looks fine"
- **Do NOT preserve existing colors** for safety, familiarity, or consistency unless they are explicitly listed as semantic colors (success / warning / destructive)
- If a component currently uses blue, pure white, gray/slate tokens, or visually "floats" due to shadow or mismatch → **it must be updated, not grandfathered**
- If there is any conflict between existing styles, previous refactors, or local component overrides → **THIS DOCUMENT WINS**
- Visual regressions are acceptable temporarily if required to remove blue, remove pure white, or enforce ink-based hierarchy — they must be fixed before completion
- **Success is defined by visual convergence to the new editorial palette**, not by minimal diffs or low-risk changes

---

## Codebase Audit Results

### Files Requiring Changes

| Category | File | Issues Found |
|----------|------|--------------|
| **bg-white** | `src/pages/Clients.tsx:1115` | `bg-white/95 backdrop-blur-sm shadow-sm` |
| **bg-white** | `src/features/events/components/WeekView.tsx:147` | `bg-white flex shrink-0 shadow-sm` |
| **bg-white** | `src/features/events/components/DayView.tsx:124` | `bg-white flex shrink-0 shadow-sm` |
| **blue-*** | `src/components/plan-editor/GroupCard.tsx:130` | `bg-blue-500/10 text-blue-600` |
| **blue-*** | `src/features/client-bookings/components/NextAppointmentCard.tsx:22` | `bg-blue-500/10 text-blue-700 border-blue-200` |
| **blue-*** | `src/features/client-bookings/components/ChangeProposalBanner.tsx:31-34` | `border-blue-200 bg-blue-50/50 text-blue-*` |
| **blue-*** | `src/features/events/components/EventEditorModal.tsx:1713-1716` | `bg-blue-50 border-blue-200 text-blue-*` |
| **blue-*** | `src/pages/BookingManagement.tsx:121-123` | `text-blue-600` |
| **blue-*** | `src/features/bookings/components/BookingRequestDrawer.tsx:128` | `text-blue-600 border-blue-600` |
| **blue-*** | `src/features/events/components/ClientViewBanner.tsx:11-12` | `border-blue-200 bg-blue-50/50 text-blue-600` |
| **blue-*** | `src/pages/ClientPlanEditor.tsx:748-760` | `bg-blue-50 border-blue-200 text-blue-*` |
| **gray-*** | `src/features/clients/components/ClientInviteSection.tsx:123` | `bg-gray-50 text-gray-700 border-gray-200` |
| **slate-*** | `src/features/events/components/WeekView.tsx:149,188,217,249` | `border-slate-200/*` |
| **slate-*** | `src/features/events/components/DayView.tsx:126,155,205` | `border-slate-200/*` |

**Total violations found: 15+ files with 50+ individual instances**

---

## Phase 1: CSS Design Tokens (`src/index.css`)

### 1.1 Canvas & Surfaces — Unified Soft Editorial White

Replace current values. All three MUST be identical:

```css
/* CURRENT (WRONG) */
--background: 0 0% 98%;
--card: 0 0% 100%;
--popover: 0 0% 100%;

/* NEW (CORRECT) — Soft editorial white */
--background: 220 14% 98%;
--card: 220 14% 98%;
--popover: 220 14% 98%;

/* Foregrounds updated for cool tone */
--foreground: 220 15% 6%;
--card-foreground: 220 15% 6%;
--popover-foreground: 220 15% 6%;
```

### 1.2 Ink Scale — Reduced to 4 Levels

Replace the 7-level scale with a focused 4-level system:

```css
/* NEW: Primary ink levels */
--ink-950: 220 15% 6%;   /* headings, strongest */
--ink-900: 220 15% 8%;   /* body text */
--ink-700: 220 10% 30%;  /* secondary text */
--ink-500: 220 8% 48%;   /* meta/muted text */

/* DEPRECATED: Keep defined for backwards compat, DO NOT USE */
--ink-800: 220 12% 14%;
--ink-600: 220 9% 32%;
--ink-300: 220 8% 70%;
--ink-200: 220 8% 92%;
```

### 1.3 Primary Color — Ink-Based (REMOVE BLUE COMPLETELY)

```css
/* CURRENT (WRONG) — Blue */
--primary: 220 55% 46%;
--primary-hover: 220 55% 40%;
--ring: 220 55% 46%;

/* NEW (CORRECT) — Ink-based */
--primary: 220 15% 10%;
--primary-foreground: 0 0% 100%;
--primary-hover: 220 15% 6%;
--ring: 220 15% 10%;
```

**Result**: Primary buttons become dark/black with white text. Focus rings become dark.

### 1.4 Muted & Borders — Refined

```css
/* NEW */
--muted: 220 12% 96%;
--border: 220 14% 90%;
```

### 1.5 Sidebar — Enhanced with Ink Ring

```css
--sidebar-background: 220 15% 6%;
--sidebar-foreground: 0 0% 94%;
--sidebar-muted: 220 10% 65%;
--sidebar-hover: 220 12% 12%;
--sidebar-active: 220 12% 16%;
--sidebar-border: 220 12% 12%;
--sidebar-ring: 220 15% 10%;
```

### 1.6 Dark Mode Updates

Apply corresponding changes to `.dark` block:
- Primary: `220 15% 20%` (lighter for dark mode visibility)
- Primary-hover: `220 15% 16%`
- Ring: `220 15% 20%`

### 1.7 Focus Ring — Wider on Sidebar

```css
/* Sidebar focus — 5px spread for visibility on dark */
[data-sidebar="root"] :where(a, button, [role="button"], [tabindex]:not([tabindex="-1"])):focus-visible {
  box-shadow:
    0 0 0 2px hsl(var(--sidebar-background)),
    0 0 0 5px hsl(var(--sidebar-ring));
}
```

---

## Phase 2: Tailwind Configuration (`tailwind.config.ts`)

### 2.1 Add ink-950 to Scale

```typescript
ink: {
  950: "hsl(var(--ink-950))",  // NEW
  900: "hsl(var(--ink-900))",
  800: "hsl(var(--ink-800))",  // DEPRECATED
  700: "hsl(var(--ink-700))",
  600: "hsl(var(--ink-600))",  // DEPRECATED
  500: "hsl(var(--ink-500))",
  300: "hsl(var(--ink-300))",  // DEPRECATED
  200: "hsl(var(--ink-200))",  // DEPRECATED
},
```

---

## Phase 3: Sticky Components (CRITICAL FIX)

### 3.1 Required Pattern

**Table headers / inline sticky** — NO blur, NO shadow:
```tsx
className="sticky top-0 z-30 bg-background border-b border-border"
```

**Global overlays** — blur OK, NO shadow:
```tsx
className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border"
```

### 3.2 Exact File Changes

**`src/pages/Clients.tsx` line 1115:**
```diff
- <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm">
+ <div className="sticky top-0 z-30 bg-background border-b border-border">
```

**`src/features/events/components/WeekView.tsx` line 147:**
```diff
- <div className="h-10 bg-white flex shrink-0 shadow-sm">
+ <div className="h-10 bg-background flex shrink-0 border-b border-border">
```

**`src/features/events/components/DayView.tsx` line 124:**
```diff
- <div className="h-10 bg-white flex shrink-0 shadow-sm">
+ <div className="h-10 bg-background flex shrink-0 border-b border-border">
```

---

## Phase 4: Calendar Border Cleanup (slate → border)

### 4.1 WeekView.tsx Changes

| Line | Current | Replace With |
|------|---------|--------------|
| 149 | `border-r border-slate-200/40` | `border-r border-border/40` |
| 188 | `border-r border-slate-200/40` | `border-r border-border/40` |
| 217 | `border-r last:border-r-0 border-slate-200/40` | `border-r last:border-r-0 border-border/40` |
| 249 | `border-t border-slate-200/80` | `border-t border-border/80` |

### 4.2 DayView.tsx Changes

| Line | Current | Replace With |
|------|---------|--------------|
| 126 | `border-r border-slate-200/40` | `border-r border-border/40` |
| 155 | `border-r border-slate-200/40` | `border-r border-border/40` |
| 205 | `border-t border-slate-200/80` | `border-t border-border/80` |

---

## Phase 5: Blue Color Removal (MANDATORY)

### 5.1 Information Banners → Neutral Styling

**`src/pages/ClientPlanEditor.tsx` lines 748-760:**
```diff
- <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm mb-6">
-   <p className="text-blue-900 dark:text-blue-100">
+ <div className="bg-muted border border-border rounded-lg p-3 text-sm mb-6">
+   <p className="text-foreground">
```

**`src/features/events/components/EventEditorModal.tsx` lines 1713-1717:**
```diff
- <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 mt-4">
-   <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
-   <p className="text-sm text-blue-700 dark:text-blue-300">
+ <div className="flex items-start gap-2 p-3 rounded-lg bg-muted border border-border mt-4">
+   <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
+   <p className="text-sm text-muted-foreground">
```

**`src/features/events/components/ClientViewBanner.tsx` lines 11-12:**
```diff
- <Alert className="border-blue-200 bg-blue-50/50 mb-4 [&>svg]:top-[20px]">
-   <Eye className="h-4 w-4 text-blue-600" />
+ <Alert className="border-border bg-muted/50 mb-4 [&>svg]:top-[20px]">
+   <Eye className="h-4 w-4 text-muted-foreground" />
```

### 5.2 Badges & Stats → Neutral

**`src/pages/BookingManagement.tsx` lines 121-123:**
```diff
- <p className="text-3xl font-bold text-blue-600">{pendingRequests.length}</p>
- <Clock className="h-8 w-8 text-blue-600 opacity-50" />
+ <p className="text-3xl font-bold text-foreground">{pendingRequests.length}</p>
+ <Clock className="h-8 w-8 text-muted-foreground opacity-50" />
```

**`src/features/bookings/components/BookingRequestDrawer.tsx` line 128:**
```diff
- <Badge variant="outline" className="text-blue-600 border-blue-600">
+ <Badge variant="outline" className="text-muted-foreground border-border">
```

**`src/components/plan-editor/GroupCard.tsx` line 130:**
```diff
- : "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
+ : "bg-muted text-foreground font-medium"
```

**`src/features/client-bookings/components/NextAppointmentCard.tsx` line 22:**
```diff
- return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-200">Proposta modifica</Badge>;
+ return <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">Proposta modifica</Badge>;
```

**`src/features/client-bookings/components/ChangeProposalBanner.tsx` lines 31-34:**
```diff
- <Alert className="border-blue-200 bg-blue-50/50">
-   <CalendarClock className="h-4 w-4 text-blue-600" />
-   <AlertTitle className="text-blue-900">Proposta di modifica</AlertTitle>
-   <AlertDescription className="text-blue-700">
+ <Alert className="border-border bg-muted/50">
+   <CalendarClock className="h-4 w-4 text-muted-foreground" />
+   <AlertTitle className="text-foreground">Proposta di modifica</AlertTitle>
+   <AlertDescription className="text-muted-foreground">
```

---

## Phase 6: Gray Color Removal

**`src/features/clients/components/ClientInviteSection.tsx` line 123:**
```diff
- return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Revocato</Badge>;
+ return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Revocato</Badge>;
```

---

## Complete File List

| Category | File | Action |
|----------|------|--------|
| **Core Theme** | `src/index.css` | Replace all tokens as specified |
| **Tailwind** | `tailwind.config.ts` | Add ink-950 |
| **Sticky Headers** | `src/pages/Clients.tsx` | Remove bg-white, shadow; add border |
| **Calendar** | `src/features/events/components/WeekView.tsx` | Remove bg-white, shadow, slate borders |
| **Calendar** | `src/features/events/components/DayView.tsx` | Remove bg-white, shadow, slate borders |
| **Blue Cleanup** | `src/pages/ClientPlanEditor.tsx` | Neutralize info banners |
| **Blue Cleanup** | `src/features/events/components/EventEditorModal.tsx` | Neutralize hint box |
| **Blue Cleanup** | `src/features/events/components/ClientViewBanner.tsx` | Neutralize alert |
| **Blue Cleanup** | `src/pages/BookingManagement.tsx` | Neutralize stats |
| **Blue Cleanup** | `src/features/bookings/components/BookingRequestDrawer.tsx` | Neutralize badge |
| **Blue Cleanup** | `src/components/plan-editor/GroupCard.tsx` | Neutralize circuit badge |
| **Blue Cleanup** | `src/features/client-bookings/components/NextAppointmentCard.tsx` | Neutralize badge |
| **Blue Cleanup** | `src/features/client-bookings/components/ChangeProposalBanner.tsx` | Neutralize alert |
| **Gray Cleanup** | `src/features/clients/components/ClientInviteSection.tsx` | Replace gray tokens |

---

## Acceptance Tests (ALL MUST PASS)

### Validation Commands
```bash
# Pure white check
grep -rn "#fff\|#ffffff\|bg-white" src/ --include="*.tsx" --include="*.css"
# Expected: 0 results

# Blue check
grep -rn "blue-\|text-blue\|bg-blue\|border-blue" src/ --include="*.tsx"
# Expected: 0 results

# Gray/Slate check
grep -rn "gray-\|slate-" src/ --include="*.tsx"
# Expected: 0 results
```

### Visual Verification
- [ ] No pure white (`#ffffff`) anywhere in codebase
- [ ] No blue visible in UI chrome (buttons, badges, focus rings, banners)
- [ ] No gray/slate Tailwind tokens
- [ ] Cards distinguishable from canvas via border
- [ ] Sticky headers visually merge with background (no shadows)
- [ ] Primary buttons are dark/black with white text
- [ ] Focus rings are dark/ink-based
- [ ] Sidebar remains dark and high-contrast
- [ ] UI remains readable in grayscale screenshot

### Grayscale Test
Screenshot the app → desaturate to grayscale. You should see:
- Clear hierarchy via ink weight only
- Zero blue anywhere
- No harsh white blocks
- Sidebar reading as a deliberate black slab
- Sticky headers visually welded to the canvas

---

## Final Rule

If a color does not convey meaning or hierarchy, **remove it**.

The new palette must feel: **Editorial • Calm • Confident • Premium • Fitness-industry appropriate**

