# Keyboard Navigation Implementation

## Overview

This document describes the keyboard navigation features implemented for the exports page to ensure full accessibility compliance with WCAG 2.1 AA standards.

## Features Implemented

### 1. Keyboard Shortcuts

The following keyboard shortcuts are available on the exports page:

- **Ctrl+E**: Focus on the "Create Export" button

  - Displays a notification guiding the user to press Enter
  - Only works when the button is enabled (form is valid)

- **Ctrl+R**: Refresh all processing jobs
  - Refreshes status for all jobs currently in "processing" state
  - Displays notification with count of jobs being refreshed
  - Shows info message if no processing jobs exist

### 2. Skip Links

A skip link is provided at the top of the page for screen reader users and keyboard navigation:

- **Skip to main content**: Jumps directly to the filter panel
- Visible only when focused (hidden otherwise)
- Positioned at top-left with high z-index
- Styled with blue background for visibility

### 3. Focus Indicators

Enhanced focus indicators are applied to all interactive elements:

- **Visible outline**: 3px solid blue outline on focus
- **Box shadow**: Soft glow effect (4px rgba blue)
- **Outline offset**: 2px spacing for clarity
- **Theme-aware**: Uses primary color from theme system
- **Mouse vs Keyboard**: Only shows for keyboard focus (`:focus-visible`)

### 4. ARIA Labels and Semantic HTML

Proper semantic HTML and ARIA attributes are used throughout:

- `<header>`: Page header with title
- `<nav>`: Tab navigation with `role="tablist"`
- `<main>`: Main content area with `id="main-content"`
- `<section>`: Jobs list section with `aria-label`
- Tab buttons: `role="tab"`, `aria-selected`, `aria-controls`
- Tab panels: `role="tabpanel"`, `aria-labelledby`

### 5. Tab Order

Logical tab order is maintained:

1. Skip link (when focused)
2. Tab navigation (Hotel Exports / Mapping Exports)
3. Filter panel inputs (in order)
4. Create Export button
5. Jobs list actions (refresh, download, delete)
6. Clear Completed button

### 6. Interactive Elements

All interactive elements are keyboard accessible:

- **Buttons**: Tab + Enter/Space
- **Links**: Tab + Enter
- **Inputs**: Tab + typing
- **Checkboxes**: Tab + Space
- **Radio buttons**: Tab + Arrow keys
- **Dropdowns**: Tab + Enter + Arrow keys

## Technical Implementation

### Custom Hook: `useKeyboardShortcuts`

```typescript
useKeyboardShortcuts([
  {
    key: "e",
    ctrlKey: true,
    callback: () => {
      /* Focus export button */
    },
    description: "Focus on create export button",
  },
  {
    key: "r",
    ctrlKey: true,
    callback: () => {
      /* Refresh jobs */
    },
    description: "Refresh all processing jobs",
  },
]);
```

### Skip Link Component

```tsx
<SkipLink href="#main-content">Skip to main content</SkipLink>
```

### Focus Management

```tsx
const filterPanelRef = useRef<HTMLDivElement>(null);
const jobsListRef = useRef<HTMLDivElement>(null);

// Focus on filter panel submit button
const submitButton = filterPanelRef.current?.querySelector(
  'button[type="submit"]'
);
submitButton?.focus();
```

### Enhanced CSS Focus Styles

```css
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}
```

## Testing Checklist

- [x] All interactive elements are keyboard accessible
- [x] Tab order is logical and follows visual flow
- [x] Focus indicators are visible and clear
- [x] Keyboard shortcuts work as expected
- [x] Skip link is functional
- [x] ARIA labels are present and accurate
- [x] Semantic HTML is used throughout
- [x] No keyboard traps exist
- [x] Enter/Space keys activate buttons
- [x] Escape key closes modals/dropdowns

## Browser Compatibility

Tested and working in:

- Chrome/Edge (Chromium)
- Firefox
- Safari

## Screen Reader Compatibility

Compatible with:

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)

## Future Enhancements

Potential improvements for future iterations:

1. **More keyboard shortcuts**:

   - Ctrl+D: Download first completed job
   - Ctrl+K: Open command palette
   - Ctrl+/: Show keyboard shortcuts help

2. **Focus trap for modals**: Ensure focus stays within modal when open

3. **Keyboard navigation for table**: Arrow keys to navigate between cells

4. **Quick actions**: Number keys (1-9) to select jobs

5. **Search/filter**: Ctrl+F to focus on search input (if added)

## Requirements Met

This implementation satisfies Requirement 9.5:

- ✅ All interactive elements are keyboard accessible (Tab, Enter, Space)
- ✅ Visible focus indicators on all focusable elements
- ✅ Keyboard shortcuts implemented (Ctrl+E, Ctrl+R)
- ✅ Logical tab order tested and verified
- ✅ Skip links added for screen readers

## Related Files

- `lib/hooks/use-keyboard-shortcuts.ts` - Keyboard shortcuts hook
- `lib/components/ui/skip-link.tsx` - Skip link component
- `app/dashboard/exports/page.tsx` - Main page with keyboard navigation
- `app/globals.css` - Enhanced focus styles
