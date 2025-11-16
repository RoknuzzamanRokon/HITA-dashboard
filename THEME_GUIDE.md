# Theme System Guide

## Overview

The application now supports multiple color themes that can be easily switched by users. The theme system includes:

- **Blue** (Default) - Professional blue theme
- **Black** - Elegant dark gray/black theme
- **Orange** - Vibrant orange theme
- **Teal** - Modern teal/cyan theme

## How to Use

### 1. Import the Theme Switcher Component

```tsx
import { ThemeSwitcher } from "@/lib/components/ui/theme-switcher";
```

### 2. Add to Your Layout or Page

```tsx
export default function YourPage() {
  return (
    <div>
      {/* Add theme switcher in header or settings */}
      <ThemeSwitcher />

      {/* Your content */}
    </div>
  );
}
```

### 3. Theme Switcher Props

```tsx
<ThemeSwitcher className="ml-auto" />
```

## Available Themes

### Blue Theme (Default)

- Primary Color: `#3b82f6`
- Hover Color: `#2563eb`
- Light Color: `#dbeafe`
- Dark Color: `#1e40af`

### Black Theme

- Primary Color: `#1f2937`
- Hover Color: `#111827`
- Light Color: `#f3f4f6`
- Dark Color: `#030712`

### Orange Theme

- Primary Color: `#f97316`
- Hover Color: `#ea580c`
- Light Color: `#ffedd5`
- Dark Color: `#c2410c`

### Teal Theme

- Primary Color: `#14b8a6`
- Hover Color: `#0d9488`
- Light Color: `#ccfbf1`
- Dark Color: `#0f766e`

## How It Works

The theme system uses CSS custom properties (CSS variables) defined in `app/globals.css`:

```css
:root {
  --primary-color: #3b82f6;
  --primary-rgb: 59, 130, 246;
  --primary-hover: #2563eb;
  --primary-light: #dbeafe;
  --primary-dark: #1e40af;
}

:root[data-theme="black"] {
  --primary-color: #1f2937;
  /* ... */
}
```

When a theme is selected:

1. The `data-theme` attribute is set on the root HTML element
2. CSS variables are updated automatically
3. All components using these variables update their colors
4. The selection is saved to localStorage for persistence

## Adding New Themes

To add a new theme:

1. **Add CSS Variables** in `app/globals.css`:

```css
:root[data-theme="purple"] {
  --primary-color: #9333ea;
  --primary-rgb: 147, 51, 234;
  --primary-hover: #7e22ce;
  --primary-light: #f3e8ff;
  --primary-dark: #6b21a8;
}
```

2. **Update Theme Switcher** in `lib/components/ui/theme-switcher.tsx`:

```tsx
const themes = [
  // ... existing themes
  { value: "purple", label: "Purple", color: "#9333ea", icon: "🟣" },
];
```

## Using Theme Colors in Components

### Method 1: CSS Variables (Recommended)

```tsx
<div className="bg-primary-color text-white">Content</div>
```

### Method 2: Tailwind Classes

The system automatically applies theme colors to standard Tailwind classes:

```tsx
<button className="bg-blue-600 hover:bg-blue-700">Button</button>
```

These will automatically use the current theme's primary color.

## Example Integration

### In Dashboard Header

```tsx
import { ThemeSwitcher } from "@/lib/components/ui/theme-switcher";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Dashboard</h1>
      <ThemeSwitcher />
    </header>
  );
}
```

### In Settings Page

```tsx
import { ThemeSwitcher } from "@/lib/components/ui/theme-switcher";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Appearance Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Color Theme</label>
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
```

## Browser Support

The theme system works in all modern browsers that support:

- CSS Custom Properties
- localStorage API
- data attributes

## Accessibility

The theme switcher includes:

- Keyboard navigation support
- ARIA labels
- Focus management
- Screen reader friendly

## Performance

- Themes are applied instantly with no page reload
- Theme preference is persisted in localStorage
- Minimal CSS overhead (only CSS variables change)
- No JavaScript required after initial load

## Troubleshooting

### Theme not persisting

- Check if localStorage is enabled in the browser
- Verify the theme switcher component is mounted

### Colors not updating

- Ensure components use CSS variables or Tailwind classes
- Check if custom styles override theme colors
- Clear browser cache if needed

### Theme switcher not visible

- Verify the component is imported correctly
- Check z-index if dropdown is hidden
- Ensure parent container doesn't have overflow:hidden

## Future Enhancements

Potential improvements:

- System theme detection (light/dark mode)
- Custom theme builder
- Theme preview before applying
- More color variations
- Gradient themes
- Animation preferences
