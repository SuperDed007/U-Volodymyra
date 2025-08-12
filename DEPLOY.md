# Швидкий деплой

## Vercel (рекомендовано)
1) Створи порожній репозиторій на GitHub.
2) Завантаж усі файли з цього проєкту (включно з `vercel.json`).
3) На https://vercel.com → **New Project** → обери репозиторій → Deploy.

## Netlify
1) Netlify → **Add new site** → **Import from Git**.
2) Build: `npm run build`, Publish: `dist` (файл `netlify.toml` уже налаштовано).
3) Deploy.

*Готово — сайт стане доступним за публічним посиланням.*