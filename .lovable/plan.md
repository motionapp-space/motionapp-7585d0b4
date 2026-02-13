
## Updating Sidebar Color to #7442E4 (Purple)

### Overview
The user wants to change the sidebar background color from the current dark ink-based color (`220 15% 6%`) to a vibrant purple (`#7442E4`). This is a design system update that will affect both light and dark modes.

### Technical Analysis

**Current State:**
- Sidebar background is controlled by the `--sidebar-background` CSS variable
- Currently set to `220 15% 6%` (dark near-black) in both light mode (`:root`) and dark mode (`.dark`)
- Related sidebar tokens that work with the background:
  - `--sidebar-foreground: 0 0% 94%` (light text for contrast)
  - `--sidebar-muted: 220 10% 65%` (muted text)
  - `--sidebar-hover: 220 12% 12%` (hover state)
  - `--sidebar-active: 220 12% 16%` (active nav state)
  - `--sidebar-accent: 220 10% 22%` (accent elements)
  - `--sidebar-ring: 220 15% 10%` (focus ring)

**Color Conversion:**
- `#7442E4` (hex) = `264 73% 52%` (HSL)
- This is a vibrant, saturated purple with strong visual presence

### Implementation Plan

**Step 1: Update CSS Variables in `src/index.css`**
- Convert `--sidebar-background` from `220 15% 6%` to `264 73% 52%` in both `:root` and `.dark` sections
- Keep `--sidebar-foreground` as `0 0% 94%` (white text maintains good contrast on purple)
- Update related sidebar tokens for visual coherence:
  - `--sidebar-hover`: Lighten to ~`264 73% 60%` (lighter shade of the same purple for hover)
  - `--sidebar-active`: Adjust to ~`264 73% 45%` (darker shade for active state)
  - Consider adjusting `--sidebar-muted` to work with the purple palette: `264 20% 70%` (lighter purple-tinted muted)

**Step 2: Verify Component Integration**
- `AppSidebar.tsx` uses Tailwind classes: `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-hover`, `bg-sidebar-active`, `text-sidebar-muted`
- These map directly to the CSS variables, so no component code changes are needed
- The active indicator bar (left 2px border) uses `bg-primary` and will remain ink-based, which may need review for visual hierarchy

**Step 3: Design System Consistency**
- Verify that the purple sidebar works with the existing ink-based primary color (`220 15% 10%`) for buttons and indicators
- Consider if the active indicator bar should also shift to complement the purple, or remain as a neutral accent
- Test contrast ratios for accessibility (WCAG AA compliance)

**Step 4: Testing Considerations**
- Verify sidebar appears correctly on all screen sizes (desktop, tablet, mobile collapse)
- Check that nav items are readable with the new background
- Ensure hover and active states are visually distinct
- Test in both light mode and dark mode (though both use the same sidebar background currently)
- Verify tooltip visibility on the collapsed sidebar state

### Files to Modify
- `src/index.css` (CSS variable updates only)

### No Changes Required
- `src/components/AppSidebar.tsx` (component structure remains unchanged)
- No TypeScript or React code modifications needed
