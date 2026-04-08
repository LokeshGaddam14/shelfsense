---
name: ui-ux-pro-max
description: Apply professional, premium UI/UX design principles to any interface. Use when the user wants to elevate their design, improve user experience, create polished interfaces, or when they say "make it look better", "improve the UX", "premium design", "professional look", or "design overhaul".
metadata:
  version: "1.0.0"
---

# UI/UX Pro Max Skill

Transform interfaces into premium, polished, production-grade experiences.

## Design Philosophy

**Principle 1: Hierarchy First**
Every screen needs a clear visual hierarchy. Users should immediately know what to look at first. Achieve this through size contrast, weight contrast, color contrast, and spatial separation — not decoration.

**Principle 2: Intentional Whitespace**
Whitespace is not empty space — it's the breathing room that makes content legible and interfaces feel premium. Generous padding and margins signal quality.

**Principle 3: Consistent Design Tokens**
Use CSS custom properties for all colors, spacing, radii, shadows, and typography. Never hardcode values inline.

**Principle 4: Motion with Purpose**
Animations should communicate state changes, guide attention, and provide feedback — not just look pretty. Every animation should have a reason.

## UI Checklist

### Typography
- [ ] Maximum 2-3 typefaces per project
- [ ] Clear type scale with defined steps (xs, sm, base, lg, xl, 2xl, etc.)
- [ ] Line height: 1.4-1.6 for body, 1.1-1.3 for headings
- [ ] Letter spacing: slightly tighter for headings, normal for body
- [ ] Sufficient contrast (WCAG AA minimum: 4.5:1 for text)

### Color
- [ ] Defined primary, secondary, accent, neutral palettes
- [ ] Semantic colors: success, warning, error, info
- [ ] Dark mode support via CSS variables
- [ ] No pure black (#000) or pure white (#fff) — use near-blacks and off-whites
- [ ] Accessible contrast ratios throughout

### Spacing
- [ ] Consistent spacing scale (4px base unit: 4, 8, 12, 16, 24, 32, 48, 64, 96)
- [ ] Grouped related elements have less space than unrelated elements
- [ ] Content max-width set appropriately (65ch for text, 1280px for layout)

### Components
- [ ] Interactive elements have clear hover/focus/active states
- [ ] Loading states for all async operations
- [ ] Empty states designed (not just "No data")
- [ ] Error states with actionable messages
- [ ] Disabled states visually distinct but not invisible

### Micro-interactions
- [ ] Button press feedback (scale transform)
- [ ] Form field focus ring
- [ ] Smooth page/route transitions
- [ ] Skeleton loaders instead of spinners for content
- [ ] Toast/notification animations

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels for icon-only buttons
- [ ] Screen reader friendly structure
- [ ] No reliance on color alone to convey information

## Premium Design Patterns

### Glassmorphism
```css
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
}
```

### Elevated Cards
```css
.card-premium {
  background: var(--surface);
  border-radius: 16px;
  box-shadow: 
    0 1px 2px rgba(0,0,0,0.04),
    0 4px 16px rgba(0,0,0,0.08),
    0 24px 48px rgba(0,0,0,0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-premium:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.06),
    0 8px 24px rgba(0,0,0,0.12),
    0 32px 64px rgba(0,0,0,0.08);
}
```

### Smooth Transitions
```css
/* Page transitions */
.page-enter { opacity: 0; transform: translateY(8px); }
.page-enter-active { 
  opacity: 1; transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Staggered list items */
.list-item { animation: fadeSlideIn 0.4s ease both; }
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 60ms; }
.list-item:nth-child(3) { animation-delay: 120ms; }
```

## UX Heuristics (Nielsen's 10)

1. **Visibility of system status** — Always tell users what's happening
2. **Match with real world** — Use familiar concepts and language
3. **User control and freedom** — Easy undo/redo, cancel actions
4. **Consistency and standards** — Follow platform conventions
5. **Error prevention** — Design to prevent mistakes before they happen
6. **Recognition over recall** — Make options visible, minimize memory load
7. **Flexibility and efficiency** — Shortcuts for power users
8. **Aesthetic and minimalist design** — Only show what's needed
9. **Help users recognize and recover from errors** — Clear, actionable error messages
10. **Help and documentation** — Provide contextual help

## Output Format

When reviewing or redesigning a UI, provide:
1. **Current state assessment** — What's working, what's not
2. **Priority issues** — Ranked by user impact
3. **Specific fixes** — With code when applicable
4. **Premium upgrades** — Suggestions to elevate quality beyond the basics
