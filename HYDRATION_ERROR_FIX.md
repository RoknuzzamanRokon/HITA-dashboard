# Hydration Error Fix Guide

## Problem

React hydration error occurred during deployment:

```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

## Root Causes

### 1. Theme Provider Hydration Mismatch

The `ThemeProvider` was applying classes and styles to `document.documentElement` immediately, causing server/client HTML mismatch.

### 2. Browser Extensions

Browser extensions (like Grammarly) add attributes to the DOM that don't exist in server-rendered HTML:

- `data-new-gr-c-s-check-loaded`
- `data-gr-ext-installed`

## Solutions Applied

### 1. Added Mounted State to ThemeProvider

**File**: `lib/contexts/theme-context.tsx`

**Before**:

```typescript
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(resolvedTheme);
    // ... more DOM manipulations
  }, [resolvedTheme, settings]);
}
```

**After**:

```typescript
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    // Load settings...
  }, []);

  useEffect(() => {
    if (!mounted) return; // Skip on server and first render

    const root = document.documentElement;
    root.classList.add(resolvedTheme);
    // ... more DOM manipulations
  }, [mounted, resolvedTheme, settings]);
}
```

**Why This Works**:

- `mounted` is `false` during SSR and first client render
- DOM manipulations only happen after hydration is complete
- Server and client HTML match perfectly

### 2. Added suppressHydrationWarning to Root Layout

**File**: `app/layout.tsx`

**Before**:

```tsx
<html lang="en">
  <body className="antialiased">{children}</body>
</html>
```

**After**:

```tsx
<html lang="en" suppressHydrationWarning>
  <body className="antialiased" suppressHydrationWarning>
    {children}
  </body>
</html>
```

**Why This Works**:

- Suppresses warnings for attributes added by browser extensions
- Only suppresses warnings on `<html>` and `<body>` tags
- Doesn't affect child components

## Understanding Hydration

### What is Hydration?

1. **Server**: Renders HTML and sends to browser
2. **Client**: React "hydrates" the HTML by attaching event listeners
3. **Problem**: If HTML doesn't match, React shows warnings

### Common Causes

- ❌ Using `Date.now()` or `Math.random()` during render
- ❌ Accessing `window` or `document` during render
- ❌ Using `localStorage` before component mounts
- ❌ Browser extensions modifying DOM
- ❌ Conditional rendering based on `typeof window`

### Best Practices

- ✅ Use `useEffect` for client-only code
- ✅ Add `mounted` state for DOM manipulations
- ✅ Use `suppressHydrationWarning` for known mismatches
- ✅ Avoid dynamic content during SSR
- ✅ Use consistent date formatting

## Testing the Fix

### 1. Development Mode

```bash
npm run dev
```

- Open browser console
- Check for hydration warnings
- Should see no errors

### 2. Production Build

```bash
npm run build
npm start
```

- Test in production mode
- Verify no hydration errors
- Check all pages load correctly

### 3. Different Browsers

Test in:

- ✅ Chrome (with and without extensions)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### 4. Disable Browser Extensions

```
Chrome: Settings → Extensions → Disable all
Firefox: Add-ons → Extensions → Disable all
```

- Test without extensions
- Verify errors are gone

## Additional Fixes for Common Issues

### Issue: Date/Time Rendering

```typescript
// ❌ Bad - Different on server and client
<div>{new Date().toLocaleString()}</div>;

// ✅ Good - Only render on client
const [time, setTime] = useState<string>("");

useEffect(() => {
  setTime(new Date().toLocaleString());
}, []);

return <div>{time || "Loading..."}</div>;
```

### Issue: Window/Document Access

```typescript
// ❌ Bad - Causes hydration error
const isMobile = window.innerWidth < 768;

// ✅ Good - Use effect hook
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  setIsMobile(window.innerWidth < 768);
}, []);
```

### Issue: LocalStorage Access

```typescript
// ❌ Bad - localStorage not available on server
const [theme, setTheme] = useState(localStorage.getItem("theme"));

// ✅ Good - Load after mount
const [theme, setTheme] = useState<string | null>(null);

useEffect(() => {
  setTheme(localStorage.getItem("theme"));
}, []);
```

### Issue: Conditional Rendering

```typescript
// ❌ Bad - Different on server and client
{
  typeof window !== "undefined" && <ClientComponent />;
}

// ✅ Good - Use mounted state
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

return mounted ? <ClientComponent /> : null;
```

## Verification Checklist

- [x] Added `mounted` state to ThemeProvider
- [x] Wrapped DOM manipulations in mounted check
- [x] Added `suppressHydrationWarning` to root layout
- [x] Tested in development mode
- [x] Tested in production build
- [x] Verified no console errors
- [x] Tested with browser extensions disabled
- [x] Tested in multiple browsers

## Deployment Checklist

Before deploying:

1. ✅ Run `npm run build` locally
2. ✅ Check for hydration warnings
3. ✅ Test production build with `npm start`
4. ✅ Verify all pages load correctly
5. ✅ Check browser console for errors
6. ✅ Test with different browsers
7. ✅ Deploy to staging first
8. ✅ Test staging environment
9. ✅ Deploy to production

## Monitoring

After deployment, monitor for:

- Console errors in production
- User reports of visual glitches
- Performance metrics
- Error tracking (Sentry, LogRocket, etc.)

## Prevention

To prevent future hydration errors:

### 1. Use ESLint Rules

```json
{
  "rules": {
    "react/no-danger": "error",
    "react/no-direct-mutation-state": "error"
  }
}
```

### 2. Code Review Checklist

- [ ] No `window` or `document` access during render
- [ ] No `localStorage` access before mount
- [ ] No dynamic dates/times during render
- [ ] All client-only code in `useEffect`
- [ ] Proper use of `suppressHydrationWarning`

### 3. Testing Strategy

```typescript
// Add to test suite
describe("Hydration", () => {
  it("should not have hydration errors", () => {
    const { container } = render(<App />);
    expect(console.error).not.toHaveBeenCalled();
  });
});
```

## Resources

- [Next.js Hydration Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration Guide](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Common Hydration Issues](https://nextjs.org/docs/messages/react-hydration-error#common-causes)

## Support

If hydration errors persist:

1. Check browser console for specific error messages
2. Identify which component is causing the issue
3. Add `mounted` state to that component
4. Use `suppressHydrationWarning` if needed
5. Test thoroughly before deploying

## Summary

✅ **Fixed**: Theme provider hydration mismatch
✅ **Fixed**: Browser extension attribute warnings
✅ **Added**: Mounted state pattern
✅ **Added**: Hydration warning suppression
✅ **Tested**: Development and production builds
✅ **Ready**: For deployment

The application is now hydration-error-free and ready for production deployment! 🚀
