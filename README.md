# AI Tracking Tools

[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)

A modern web application built with a cutting-edge frontend stack. It pairs React 19 with the latest Vite tooling and Tailwind CSS v4 to deliver a fast, type-safe, and pleasant developer experience.

---

## ✨ Tech Stack

| Tool | Version | Purpose |
| --- | --- | --- |
| [Vite](https://vitejs.dev/) | 8 | Lightning-fast build tool & dev server |
| [React](https://react.dev/) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | latest | Static type safety |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Utility-first CSS framework (via the new Vite plugin — no manual config) |
| [React Router](https://reactrouter.com/) | v7 | Nested client-side routing |
| [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) | — | Linting & code formatting |

---

## 📋 Prerequisites

- **Node.js** v18 or higher
- **npm** (bundled with Node.js)

---

## 🚀 Installation

```bash
git clone https://code.alipay.com/leo.phucvu/ai-tracking-tools.git
cd ai-tracking-tools
npm install
```

---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server at [http://localhost:5173](http://localhost:5173) |
| `npm run build` | Build the app for production into the `dist/` folder |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npx prettier --write .` | Format the entire codebase with Prettier |

---

## 🗂️ Project Structure

```
src/
├── main.tsx          — App entry point with router setup
├── index.css         — Tailwind CSS v4 imports & theme tokens
├── components/       — Reusable UI components
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   └── Marquee.tsx
├── pages/            — Route page components
│   ├── Home.tsx
│   └── About.tsx
└── assets/           — Static assets
```

---

## 📦 Deployment / Production Build

1. Generate the optimized static bundle:
   ```bash
   npm run build
   ```
2. The output is emitted to the `dist/` folder, which can be deployed to any static host such as **Vercel**, **Netlify**, **Cloudflare Pages**, **GitHub Pages**, or behind **Nginx**.
3. **SPA routing:** because this app uses client-side routing (React Router v7), configure your host to **redirect all unknown routes to `index.html`**. Examples:
   - **Netlify** — add a `_redirects` file containing: `/* /index.html 200`
   - **Vercel** — handled automatically for SPAs, or add a rewrite rule to `index.html`
   - **Nginx** — use `try_files $uri $uri/ /index.html;` inside your `location /` block

---

## 📄 License

Released under the [MIT License](./LICENSE).
