# U — Volodymyra (Меню)
React + Vite + Tailwind демо для онлайн-меню з кошиком.

## Локальний запуск
```bash
npm i
npm run dev
```

## Білд
```bash
npm run build
npm run preview
```

## Деплой
- **Vercel**: імпорт репозиторію → Framework preset: Vite → Build command: `npm run build` → Output dir: `dist`.
- **Netlify**: New site from Git → Build: `npm run build` → Publish: `dist`.
- **GitHub Pages**: `npm run build` і задеплоїти `/dist` через GitHub Pages (branch `gh-pages` або `/docs`).