# Contributor setup

```bash
npm ci        # install exactly what the lockfile pins
npm start     # dev server on http://localhost:3000
npm test      # jest + testing-library
npm run build # production bundle in build/
```

## Node version

`react-scripts@4` uses webpack 4, whose hashing breaks on OpenSSL 3. On Node 17+
run the build as:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

Both GitHub Actions workflows already set this.

## Formatting and hooks

Prettier is enforced by ESLint, and the production build treats warnings as
errors — so unformatted code fails the build. Husky + lint-staged format staged
files on commit; to do it by hand:

```bash
npx prettier --write "src/**/*.{ts,tsx,css}"
```

## Testing against another repository

No rebuild needed: open **Settings** in the app and enter any `owner/repo`.
Defaults for a fresh browser come from `.env`.
