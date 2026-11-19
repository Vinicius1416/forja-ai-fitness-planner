# FORJA — Seu treino, sua evolução

App web (PWA) de treino e nutrição: treinos de segunda a sexta, calculadora de nutrição com fórmulas científicas, coach motivacional e acompanhamento de evolução com fotos.

Feito com React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts e Three.js.

## Rodar localmente

Requer Node.js 20+.

```bash
npm install
npm run dev
```

Abre em http://localhost:3000.

## Build de produção

```bash
npm run build
npm run preview
```

## Publicar no GitHub Pages

1. Suba o projeto para um repositório no GitHub (branch `main`).
2. No repositório, vá em **Settings → Pages**.
3. Em **Source**, escolha **GitHub Actions**.
4. A cada push na `main`, o workflow `.github/workflows/deploy.yml` faz o build e publica.

O site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.
