# Eliott Soirot — Portfolio

Personal portfolio site: hero, tech stack, professional experience, education, projects, and contact. "Cyberdeck / hangar bay" retro-sci-fi CRT aesthetic. Built with [TanStack Start](https://tanstack.com/start), React 19 (SSR), and Tailwind CSS v4. UI primitives follow the [shadcn](https://ui.shadcn.com/) pattern on top of [Radix UI](https://www.radix-ui.com/).

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | TanStack Start (React 19, SSR, file-based routing via TanStack Router) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Components | Radix UI primitives, `class-variance-authority`, `tailwind-merge` |
| Icons | lucide-react, `@icons-pack/react-simple-icons` |
| Animation | animejs |
| Tooling | TypeScript, ESLint (`@tanstack/eslint-config`), Prettier |

## Getting started

Package manager: **pnpm** (repo has `pnpm-workspace.yaml` / `pnpm-lock.yaml` — don't use npm/yarn).

```bash
pnpm install
pnpm dev              # http://localhost:3000
```

## Scripts

```bash
pnpm dev              # vite dev, port 3000
pnpm build             # vite build
pnpm preview            # preview prod build
pnpm lint              # eslint
pnpm format             # prettier --write . && eslint --fix
pnpm check              # prettier --check .
pnpm generate-routes        # tsr generate (regenerate src/routeTree.gen.ts)
```

No test suite in this repo — none configured, don't hunt for one.

Add a shadcn/ui primitive:

```bash
pnpm dlx shadcn@latest add <component>
```
(style: `new-york`, base color `zinc`, icon lib `lucide`, no `rsc`.)

## Project structure

- `src/routes/` — TanStack Router file-based routes; `src/routeTree.gen.ts` is generated, never hand-edit
- `src/components/` — every component, flat
- `src/components/ui/` — shadcn-style primitives
- `src/components/data.ts` — single source of truth for site copy (experience, formations, tech stack, projects, contact); mostly French
- `src/styles.css` — single global stylesheet (~3400 lines: Tailwind v4 + hand-written CSS driving the CRT/hangar-bay theme), no CSS modules

Path aliases `#/*` and `@/*` both map to `./src/*` — existing code imports via `#/...`, match that.
