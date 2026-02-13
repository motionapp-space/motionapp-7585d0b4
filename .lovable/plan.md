

# Ice Neutral Accent -- Final Plan (v4)

## Overview
Replace the current neutral accent system with an "Ice Neutral" tint that acts as cold light on interaction states only. This is the final, reviewed plan incorporating all corrections.

---

## Phase 1 -- Design Tokens (`src/index.css`)

### Light Mode (`:root`)

Replace the accent block and ring token. Remove `--accent-hover`.

```css
--accent: 222 35% 68%;
--accent-foreground: 220 15% 6%;
--accent-soft-2: 222 55% 94% / 0.35;
--accent-soft-4: 222 55% 94% / 0.55;
--accent-soft-6: 222 55% 94% / 0.70;
--ring: 222 35% 68%;
--selection-bg: 222 55% 94%;
--selection-border: 222 35% 68% / 0.5;
```

### Dark Mode (`.dark`)

Replace the accent block and ring token. Remove `--accent-hover`.

```css
--accent: 222 35% 72%;
--accent-foreground: 220 15% 6%;
--accent-soft-2: 222 35% 72% / 0.06;
--accent-soft-4: 222 35% 72% / 0.10;
--accent-soft-6: 222 35% 72% / 0.14;
--ring: 222 35% 72%;
--selection-bg: 222 35% 72% / 0.10;
--selection-border: 222 35% 72% / 0.35;
```

### Sidebar tokens -- NO CHANGE

### Global link rule (add after focus-visible rule):

```css
a:not([class]) {
  color: hsl(var(--accent));
  text-decoration-line: underline;
  text-underline-offset: 4px;
}
a:not([class]):hover {
  opacity: 0.8;
}
```

---

## Phase 2 -- shadcn UI Components

All `bg-accent` solid fills replaced with overlay tokens.

### button.tsx
- `ghost` hover: `hover:bg-muted` -> `hover:bg-[hsl(var(--accent-soft-4))]`
- `outline` hover: `hover:bg-muted` -> `hover:bg-[hsl(var(--accent-soft-4))]`
- `link`: `text-primary` -> `text-[hsl(var(--accent))]`, add `hover:opacity-80`

### toggle.tsx
- `data-[state=on]:bg-accent` -> `data-[state=on]:bg-primary`
- `data-[state=on]:text-accent-foreground` -> `data-[state=on]:text-primary-foreground`
- Outline hover: `hover:bg-accent` -> `hover:bg-[hsl(var(--accent-soft-4))]`

### tabs.tsx
- Active: replace `data-[state=active]:shadow-sm` with `data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--accent))] data-[state=active]:rounded-b-none`

### table.tsx
- Row hover: `hover:bg-muted/30` -> `hover:bg-[hsl(var(--accent-soft-2))]`
- Selected: `data-[state=selected]:bg-muted` -> `data-[state=selected]:bg-[hsl(var(--selection-bg))]`

### dialog.tsx / sheet.tsx
- Close button: add `hover:bg-[hsl(var(--accent-soft-4))]`

### dropdown-menu.tsx / context-menu.tsx / menubar.tsx
- All `focus:bg-accent` -> `focus:bg-[hsl(var(--accent-soft-4))]`
- All `data-[state=open]:bg-accent` -> `data-[state=open]:bg-[hsl(var(--accent-soft-4))]`

### select.tsx
- `focus:bg-accent` -> `focus:bg-[hsl(var(--accent-soft-4))]`

### command.tsx
- `data-[selected='true']:bg-accent` -> `data-[selected='true']:bg-[hsl(var(--accent-soft-4))]`

### navigation-menu.tsx
- `hover:bg-accent` / `focus:bg-accent` -> `hover:bg-[hsl(var(--accent-soft-4))]` / `focus:bg-[hsl(var(--accent-soft-4))]`
- `data-[active]:bg-accent/50` / `data-[state=open]:bg-accent/50` -> overlay equivalents

### calendar.tsx
- `[&:has([aria-selected])]:bg-accent` -> `[&:has([aria-selected])]:bg-[hsl(var(--selection-bg))]`
- `aria-selected:bg-accent/50` -> `aria-selected:bg-[hsl(var(--accent-soft-4))]`
- `aria-selected:bg-accent` (range middle) -> `aria-selected:bg-[hsl(var(--selection-bg))]`

---

## Phase 3 -- Custom Components

All `bg-accent` / `hover:bg-accent` replaced with overlay tokens:

| Component | Change |
|-----------|--------|
| `CategoryMultiSelect.tsx` | hover/focus -> accent-soft-4 |
| `icon-tooltip-button.tsx` | hover -> accent-soft-4 |
| `CopilotPanel.tsx` | hover -> accent-soft-4 |
| `EventEditorModal.tsx` | hover -> accent-soft-4 |
| `ClientAppointmentModal.tsx` | hover -> accent-soft-4 |
| `SlotSelectorSheet.tsx` | bg-accent -> accent-soft-6, hover -> accent-soft-4 |
| `RequestedCard.tsx` / `ConfirmedCard.tsx` | hover -> accent-soft-2 |
| `ClientWorkoutDayCard.tsx` | hover -> accent-soft-4 |
| `ExerciseHistoryDrawer.tsx` | hover -> accent-soft-4 |
| `UploadDialog.tsx` | hover -> accent-soft-4 |
| `ClientHistoryItem.tsx` | hover -> accent-soft-2 |
| `DraggableHandle.tsx` | hover -> accent-soft-4 |

---

## Phase 4 -- Sidebar (`AppSidebar.tsx`)

- Hover/active: keep neutral dark tokens (NO CHANGE)
- Indicator bar only: `bg-primary` -> `bg-[hsl(var(--accent))]`
- Focus: `focus-visible:ring-primary/30` -> `focus-visible:ring-ring`

---

## Phase 5 -- Calendar Views

### WeekView.tsx / DayView.tsx
- Today header: `bg-primary/5` -> `bg-[hsl(var(--accent-soft-2))]`
- Today badge: `bg-primary text-primary-foreground` -> `bg-[hsl(var(--accent-soft-6))] border border-[hsl(var(--selection-border))] text-foreground`
- Today column body: `bg-primary/[0.02]` -> `bg-[hsl(var(--accent-soft-2))]`

### MonthView.tsx
- Today cell: `bg-accent/10` -> `bg-[hsl(var(--accent-soft-4))]`

### CalendarMonthCell.tsx
- Today text: stays `text-primary font-semibold` (ink, no change)

### SlotGrid.tsx
- Selected ring: `ring-primary` -> `ring-[hsl(var(--accent))]`

---

## Design Rule (enforced)

`bg-accent` as a Tailwind class is eliminated from the codebase. Accent base color appears only via:
- `ring-ring` / `ring-[hsl(var(--accent))]` -- focus rings
- `border-[hsl(var(--accent))]` -- borders, tab underlines
- `bg-[hsl(var(--accent))]` -- 2px indicator bars only
- `text-[hsl(var(--accent))]` -- links
- All area fills use `accent-soft-*` overlay tokens exclusively

## NOT Modified

Primary CTA, checkbox, radio, switch ON states (ink), success/warning/destructive tokens, client colors, typography, spacing, radius, elevation, sidebar bg/hover/active, spinners (ink), CalendarMonthCell today text (ink), badge semantic variants.

