# CLAUDE.md

Guidance for Claude Code when working in **tesla-admin** — панель керування (товари, авто, категорії, замовлення, ліди, блог, банери, користувачі).

## Commands

```bash
yarn dev      # next dev -p 3030
yarn build    # next build
yarn start    # next start -p 3001  (прод-порт — НЕ чіпати)
yarn lint / yarn format
```

## Architecture

**Next.js 16** (App Router) · React 19 (**React Compiler** через `babel-plugin-react-compiler`) · TanStack Query · Zustand · react-hook-form + zod · shadcn/ui (new-york) · Tailwind v4 · axios · **TipTap** (rich-text).

```
src/
├── app/
│   ├── layout.tsx · provider.tsx (QueryClient + toaster) · globals.css
│   ├── (auth)/login/          # форма входу (RHF+zod), пускає лише admin/superadmin
│   └── (dashboard)/           # layout = Sidebar+Topbar+AdminGuard; products/orders/leads/cars/categories/blog/banners/users
└── common/
    ├── components/  layout/(Sidebar,Topbar) · guards/AdminGuard · ui/(button,input,rich-text-editor) · ComingSoon · FullScreenLoader · index.ts (barrel)
    ├── services/    *.api.ts (axios)
    ├── schemas/     zod-схеми форм
    ├── store/       Zustand (auth)
    ├── hooks/ · constants/ · types/ · utils/ (shad-cn.utils → cn)
```

## Key patterns

- **RBAC** — `AdminGuard` (в layout дашборду) редіректить не-admin на `/login`; логін перевіряє роль ∈ {admin, superadmin}. Auth — через httpOnly cookie бекенда (`withCredentials`).
- **RichTextEditor** (`ui/rich-text-editor.tsx`) — TipTap, `immediatelyRender:false` (SSR-safe), `onChange` повертає `editor.getJSON()`. **Набір extensions (StarterKit) має 1:1 збігатися з бекендом** `richTextToHtml` (ADR-0006). На збереження шлемо JSON; HTML генерує бекенд.
- **Незроблені розділи** — рендерять `<ComingSoon/>` (плейсхолдер), поки немає CRUD.
- **API** — `NEXT_PUBLIC_API_BASE_URL` (build-time), `NEXT_PUBLIC_SITE_URL`. axios з `withCredentials:true`.
- Імпорти з барелю `@/common/components`; alias `@/*` → `src/*`.

## Conventions

Prettier: **tabs, без `;`, одинарні лапки** + `prettier-plugin-tailwindcss`. shadcn — new-york. Канонічні доки (дизайн-токени, БД, ADR) — у `tesla-meta/docs`. Дизайн-система: Golden Amber, шрифти Unbounded (display) + Onest (body).
