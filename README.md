# Yap Family Tree

My interactive family tree built with **React 18**, **TypeScript**, **Tailwind CSS**, **Vite**, and **Bun**.

## Stack

| Tool                  | Purpose                      |
| --------------------- | ---------------------------- |
| React 18 + TypeScript | UI & type safety             |
| Tailwind CSS v3       | Styling with dark/light mode |
| Vite                  | Build tool & dev server      |
| Bun                   | Package manager & runtime    |
| Docker + nginx        | Production container         |

## Getting started

Install [Bun](https://bun.sh) if you do not have it:

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

```bash
bun install   # install deps
bun run dev   # start dev server  →  http://localhost:5173
bun run build # production build
```

### Docker

```bash
docker compose up --build   # →  http://localhost:3000
```

## Features

- Pan & zoom — scroll to zoom, drag to pan, fit-to-screen
- Dark / light theme toggle (top-right) — default dark, persisted in localStorage
- Zoom controls — bottom-right (+ fit −)
- Lazy-loaded images with avatar fallback

## Assets

data.json and all images live under `public/assets/` and are served as static files.
