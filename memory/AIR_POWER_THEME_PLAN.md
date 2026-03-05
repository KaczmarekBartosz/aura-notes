# Air Power Theme Implementation Plan

## Overview
Adding the 4th theme "Air Power" to Aura Notes alongside existing:
1. `brutalist`
2. `glass-light`
3. `glass-dark`

This theme features an atmospheric blue gradient background with light glassmorphism effects, creating an airy, premium feel.

---

## 1. CSS Variables Structure

### New File: `app/themes/air-power.css`

Create a new CSS file with the Air Power theme variables and component styles.

```css
/* ==========================================================================
   AIR POWER THEME STYLES
   Atmospheric blue gradient with light glassmorphism
   ========================================================================== */

html.theme-air-power {
  color-scheme: light;
  
  /* Base colors - atmospheric blue gradient */
  --background: linear-gradient(180deg, #A5C3E8 0%, #CBDCF0 40%, #E8EDF3 100%);
  --foreground: #1a2a3a;
  
  /* Typography */
  --font-sans-theme: "SF Pro Text", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-heading-theme: "SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono-theme: "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  
  /* Glassmorphism - Light Layer (Navigation & Logo) */
  --glass-light-bg: rgba(255, 255, 255, 0.2);
  --glass-light-blur: blur(12px);
  --glass-light-border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Glassmorphism - Dark Layer (Buttons) */
  --glass-dark-bg: rgba(0, 0, 0, 0.15);
  --glass-dark-blur: blur(10px);
  --glass-dark-color: #FFFFFF;
  
  /* Device Container */
  --device-radius: 60px;
  --device-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  
  /* Typography Colors */
  --heading-color: #FFFFFF;
  --nav-color: rgba(255, 255, 255, 0.9);
  --nav-active-bg: rgba(255, 255, 255, 0.25);
  
  /* Layout */
  --layout-padding: 40px;
  
  /* Component mappings - derived from spec */
  --card: rgba(255, 255, 255, 0.25);
  --card-foreground: #1a2a3a;
  --popover: rgba(255, 255, 255, 0.35);
  --popover-foreground: #1a2a3a;
  
  --primary: rgba(0, 0, 0, 0.15);
  --primary-foreground: #FFFFFF;
  
  --secondary: rgba(255, 255, 255, 0.2);
  --secondary-foreground: #1a2a3a;
  
  --muted: rgba(255, 255, 255, 0.15);
  --muted-foreground: rgba(26, 42, 58, 0.7);
  
  --accent: rgba(165, 195, 232, 0.5);
  --accent-foreground: #1a2a3a;
  
  --destructive: rgba(220, 38, 38, 0.8);
  --destructive-foreground: #FFFFFF;
  
  --border: rgba(255, 255, 255, 0.3);
  --input: rgba(255, 255, 255, 0.25);
  --ring: rgba(165, 195, 232, 0.5);
  
  /* Radius - softer than brutalist, tighter than glass */
  --radius: 1.25rem;
  --radius-sm: 0.5rem;
  --radius-md: 1rem;
  --radius-lg: 1.25rem;
  --radius-xl: 1.75rem;
  --radius-2xl: 2rem;
  
  /* Logo */
  --logo-fill: #FFFFFF;
  --logo-size: 48px;
}

/* --------------------------------------------------------------------------
   AIR POWER COMPONENT STYLES
   -------------------------------------------------------------------------- */

/* Device Container - rounded frame */
html.theme-air-power .air-device-container {
  border-radius: var(--device-radius);
  box-shadow: var(--device-shadow);
  overflow: hidden;
}

/* Glass Light Layer - Navigation & Logo */
html.theme-air-power .air-glass-light {
  background: var(--glass-light-bg);
  backdrop-filter: var(--glass-light-blur);
  -webkit-backdrop-filter: var(--glass-light-blur);
  border: var(--glass-light-border);
}

/* Glass Dark Layer - Buttons */
html.theme-air-power .air-glass-dark {
  background: var(--glass-dark-bg);
  backdrop-filter: var(--glass-dark-blur);
  -webkit-backdrop-filter: var(--glass-dark-blur);
  color: var(--glass-dark-color);
}

/* Typography - Headings */
html.theme-air-power h1 {
  color: var(--heading-color);
  font-weight: 600;
  font-size: 36px; /* scales to 42px on larger screens */
  line-height: 1.2;
  text-align: center;
}

@media (min-width: 640px) {
  html.theme-air-power h1 {
    font-size: 42px;
  }
}

/* Navigation */
html.theme-air-power .air-nav {
  font-size: 14px;
  letter-spacing: -0.01em;
  color: var(--nav-color);
}

html.theme-air-power .air-nav-item {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  transition: all 0.2s ease;
}

html.theme-air-power .air-nav-item.active,
html.theme-air-power .air-nav-item:hover {
  background: var(--nav-active-bg);
}

/* Layout */
html.theme-air-power .air-layout {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--layout-padding);
  min-height: 100vh;
}

/* Logo Icon - Three circles in triangle */
html.theme-air-power .air-logo {
  width: var(--logo-size);
  height: var(--logo-size);
  position: relative;
}

html.theme-air-power .air-logo-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--logo-fill);
  position: absolute;
}

html.theme-air-power .air-logo-circle:nth-child(1) {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

html.theme-air-power .air-logo-circle:nth-child(2) {
  bottom: 0;
  left: 0;
}

html.theme-air-power .air-logo-circle:nth-child(3) {
  bottom: 0;
  right: 0;
}

/* Background gradient applied to body/html */
html.theme-air-power body {
  background: var(--background) !important;
  background-attachment: fixed !important;
}

/* Card styles */
html.theme-air-power .air-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* Input styles */
html.theme-air-power .air-input {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-md);
  color: var(--foreground);
}

html.theme-air-power .air-input:focus {
  background: rgba(255, 255, 255, 0.45);
  border-color: rgba(255, 255, 255, 0.6);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

/* Button styles */
html.theme-air-power .air-button {
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  color: var(--foreground);
  font-weight: 500;
  transition: all 0.2s ease;
}

html.theme-air-power .air-button:hover {
  background: rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

html.theme-air-power .air-button-primary {
  background: rgba(0, 0, 0, 0.2);
  color: #FFFFFF;
}

/* Scrollbar styling */
html.theme-air-power .custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

html.theme-air-power .custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

html.theme-air-power .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

html.theme-air-power .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  html.theme-air-power .air-button,
  html.theme-air-power .air-nav-item,
  html.theme-air-power .air-card {
    transition: none;
  }
}
```

---

## 2. Theme Integration (theme.tsx, types)

### File: `types/theme.ts` - Modifications

```typescript
// BEFORE:
export type ThemeMode = 'brutalist' | 'glass-light' | 'glass-dark';

// AFTER:
export type ThemeMode = 'brutalist' | 'glass-light' | 'glass-dark' | 'air-power';
```

Update `ThemeContextValue` interface:

```typescript
// Add to ThemeContextValue:
export interface ThemeContextValue {
  // ... existing properties
  /** Check if current theme is air-power */
  isAirPower: boolean;
}
```

Update `THEMES` array:

```typescript
export const THEMES: ThemeMeta[] = [
  // ... existing themes
  {
    id: 'air-power',
    label: 'Air Power',
    description: 'Eteryczny, powietrzny styl z niebieskim gradientem',
    preview: {
      bg: 'linear-gradient(180deg, #A5C3E8 0%, #CBDCF0 40%, #E8EDF3 100%)',
      card: 'rgba(255,255,255,0.25)',
      accent: '#A5C3E8',
    },
  },
];
```

Update `THEME_CLASSNAMES`:

```typescript
export const THEME_CLASSNAMES: Record<ThemeMode, string> = {
  'brutalist': 'theme-brutalist',
  'glass-light': 'theme-glass-light',
  'glass-dark': 'theme-glass-dark',
  'air-power': 'theme-air-power',
};
```

### File: `lib/theme.tsx` - Modifications

Update `ThemeProvider` to handle `air-power` theme class:

```typescript
// In applyThemeClasses function, add handling:
const applyThemeClasses = useCallback((newTheme: ThemeMode) => {
  // ... existing code
  
  // Handle dark mode classes
  if (newTheme === 'glass-dark') {
    html.classList.add('dark');
  } else if (newTheme === 'air-power') {
    // Air power is always light, remove dark
    html.classList.remove('dark');
  } else if (newTheme === 'glass-light') {
    html.classList.remove('dark');
  } else {
    // brutalist - keep existing logic
    const savedLegacy = localStorage.getItem('aura-theme') as 'light' | 'dark' | null;
    if (savedLegacy === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}, []);
```

Update context value:

```typescript
const value = useMemo<ThemeContextValue>(() => ({
  theme,
  setTheme,
  isGlass: theme === 'glass-light' || theme === 'glass-dark' || theme === 'air-power',
  isGlassLight: theme === 'glass-light',
  isGlassDark: theme === 'glass-dark',
  isBrutalist: theme === 'brutalist',
  isAirPower: theme === 'air-power',
  cycleTheme,
}), [theme, setTheme, cycleTheme]);
```

---

## 3. Component Adaptations

### ThemeSwitcher Component Updates

The `ThemeSwitcher` component should automatically pick up the new theme from the `THEMES` array. However, update the `isGlass` logic:

```typescript
// In components using isGlass for styling decisions:
// Air Power uses glass-like styling
const isGlassLike = isGlass || isAirPower;
```

### New Components (Optional)

Create Air Power specific components in `components/air-power/`:

1. **AirLogo.tsx** - Three-circle triangle logo
2. **AirNav.tsx** - Light glass navigation
3. **AirCard.tsx** - Cards with Air Power glassmorphism
4. **AirButton.tsx** - Dark glass buttons

Example `AirLogo.tsx`:

```tsx
export function AirLogo({ className }: { className?: string }) {
  return (
    <div className={cn("air-logo", className)}>
      <div className="air-logo-circle" />
      <div className="air-logo-circle" />
      <div className="air-logo-circle" />
    </div>
  );
}
```

### globals.css Update

Add import for the new theme CSS:

```css
@import "./themes/glass.css";
@import "./themes/air-power.css";  /* NEW */
```

---

## 4. Testing Steps

### Unit Tests

Update `__tests__/theme.test.ts`:

```typescript
test('theme registry includes air-power theme', () => {
  const ids = THEMES.map((t) => t.id);
  assert.deepEqual(ids, ['brutalist', 'glass-light', 'glass-dark', 'air-power']);
});

test('theme classnames include air-power', () => {
  assert.equal(THEME_CLASSNAMES['air-power'], 'theme-air-power');
});

test('getNextTheme cycles through all themes including air-power', () => {
  assert.equal(getNextTheme('brutalist'), 'glass-light');
  assert.equal(getNextTheme('glass-light'), 'glass-dark');
  assert.equal(getNextTheme('glass-dark'), 'air-power');
  assert.equal(getNextTheme('air-power'), 'brutalist');
});

test('isValidTheme accepts air-power', () => {
  assert.equal(isValidTheme('air-power'), true);
});
```

### Manual Testing Checklist

1. **Theme Selection**
   - [ ] Air Power appears in ThemeSwitcher dropdown
   - [ ] Selecting Air Power applies correct CSS classes
   - [ ] Theme persists in localStorage

2. **Visual Verification**
   - [ ] Background shows blue gradient (#A5C3E8 → #CBDCF0 → #E8EDF3)
   - [ ] Cards have glassmorphism effect
   - [ ] Navigation has light glass layer (rgba(255,255,255,0.2))
   - [ ] Buttons have dark glass layer (rgba(0,0,0,0.15))
   - [ ] Typography uses Inter/SF Pro Display
   - [ ] H1 headings are white, centered, 36-42px

3. **Component Behavior**
   - [ ] All existing components render correctly
   - [ ] Markdown content readable
   - [ ] Inputs have proper focus states
   - [ ] Scrollbars styled appropriately
   - [ ] No backdrop-filter fallbacks work

4. **Responsive Testing**
   - [ ] Mobile layout works (safe area insets)
   - [ ] Tablet layout works
   - [ ] Desktop layout works

5. **Edge Cases**
   - [ ] Reduced motion preference respected
   - [ ] No backdrop-filter support fallback
   - [ ] Theme switching animation smooth
   - [ ] SSR renders correctly

---

## 5. File Modifications List

### New Files

| File | Purpose |
|------|---------|
| `app/themes/air-power.css` | Air Power theme CSS variables and styles |
| `components/air-power/AirLogo.tsx` | (Optional) Triangle logo component |
| `components/air-power/AirNav.tsx` | (Optional) Navigation component |
| `components/air-power/AirCard.tsx` | (Optional) Card component |
| `components/air-power/AirButton.tsx` | (Optional) Button component |
| `components/air-power/index.ts` | (Optional) Barrel export |

### Modified Files

| File | Changes |
|------|---------|
| `types/theme.ts` | Add `'air-power'` to `ThemeMode`, update `THEMES` array, add `isAirPower` to context, update `THEME_CLASSNAMES` |
| `lib/theme.tsx` | Update `applyThemeClasses` for dark mode handling, add `isAirPower` to context value, update `isGlass` logic |
| `app/globals.css` | Add import for `air-power.css` |
| `__tests__/theme.test.ts` | Add tests for air-power theme |

### Optional File Updates

| File | Changes |
|------|---------|
| `components/glass/ThemeSwitcher.tsx` | May need `isAirPower` check for glass-like styling |
| `app/layout.tsx` | Verify theme class application |
| `next.config.ts` | (If needed) Update any theme-related config |

---

## Implementation Order

1. **Create CSS file** (`app/themes/air-power.css`)
2. **Update types** (`types/theme.ts`)
3. **Update theme provider** (`lib/theme.tsx`)
4. **Update globals.css** (add import)
5. **Update tests** (`__tests__/theme.test.ts`)
6. **Test manually** in browser
7. **Create optional components** if needed

---

## Notes

- Air Power is a **light-only** theme (no dark variant needed)
- It uses glassmorphism effects similar to glass-light but with distinct color palette
- The `isGlass` context value should include `air-power` for shared glass-like styling behavior
- Consider `isGlassLike` or similar if strict glass theme separation is needed
- The gradient background requires `background-attachment: fixed` for smooth scrolling
