---
name: shadcn
description: Use when building UI with shadcn/ui components. Covers component installation, usage patterns, theming, forms, and CLI workflows. Use when user mentions shadcn, radix-ui, or asks to add/update UI components.
metadata:
  version: "1.0.0"
---

# shadcn/ui Skill

Expert guidance for building with shadcn/ui component library.

## Workflow

1. **Get project context** — Run `npx shadcn@latest info` to understand the project setup (aliases, tailwind version, icon library, framework, etc.)
2. **Check installed components first** — Before running `add`, check the `components` list. Don't import components that haven't been added, and don't re-add ones already installed.
3. **Find components** — `npx shadcn@latest search`
4. **Get docs and examples** — Run `npx shadcn@latest docs <component>` to get URLs, then fetch them.
5. **Install or update** — `npx shadcn@latest add <component>`. When updating, use `--dry-run` and `--diff` to preview changes first.
6. **Review added components** — Always read added files and verify correctness. Check for missing sub-components, missing imports, incorrect composition.

## Component Selection

| Need | Use |
|------|-----|
| Button/action | `Button` with appropriate variant |
| Form inputs | `Input`, `Select`, `Combobox`, `Switch`, `Checkbox`, `RadioGroup`, `Textarea` |
| Data display | `Table`, `Card`, `Badge`, `Avatar` |
| Navigation | `Sidebar`, `NavigationMenu`, `Breadcrumb`, `Tabs`, `Pagination` |
| Overlays | `Dialog` (modal), `Sheet` (side panel), `AlertDialog` (confirmation) |
| Feedback | `sonner` (toast), `Alert`, `Progress`, `Skeleton` |
| Charts | `Chart` (wraps Recharts) |

## Key Patterns

```tsx
// Form layout: FieldGroup + Field
// Validation: data-invalid on Field, aria-invalid on control
// Icons in buttons: data-icon, no sizing classes
// Spacing: gap-*, not space-y-*
// Equal dimensions: size-*, not w-* h-*
```

## Quick Reference

```bash
# Initialize project
npx shadcn@latest init --preset base-nova

# Add components
npx shadcn@latest add button card dialog

# Preview changes before updating
npx shadcn@latest add button --dry-run
npx shadcn@latest add button --diff button.tsx

# Search registries
npx shadcn@latest search @shadcn -q "sidebar"

# Get component docs
npx shadcn@latest docs button dialog select

# View project info
npx shadcn@latest info
```

## Critical Rules

- **NEVER** use `--overwrite` without explicit user approval
- **NEVER** fetch raw files from GitHub manually — always use the CLI
- **NEVER** hardcode import paths; use the `aliases` from project context
- Always check `isRSC` — when `true`, components using hooks need `"use client"` at the top
- Use `tailwindCssFile` for CSS variables — never create a new one
- Use `iconLibrary` from project context for icon imports — never assume `lucide-react`
