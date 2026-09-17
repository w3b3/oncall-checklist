# 🚦 On-Call Checklist

**Know what ships before you ship it.**

A single-page app for the person holding the pager. It compares the commit that
is **live right now** against the commit you are **about to promote**, and shows
the whole release in one screen: every commit, who wrote it, how much code
moves, and a pre-flight checklist you can hand to the next shift.

👉 **Live app: [w-b-dev.github.io/oncall-checklist](https://w-b-dev.github.io/oncall-checklist)**

Everything runs in the browser against the public GitHub REST API. There is no
backend, no account, and nothing leaves your machine except the calls to
`api.github.com`.

---

## Quick start (60 seconds)

1. Open the app. A three-step tour asks for the repository you want to watch.
2. Enter it as `owner/repo` and name the branch your CI deploys from
   (`gh-pages` by default).
3. Optionally paste a read-only GitHub token to lift the API limit from 60 to
   5,000 requests/hour — it is stored in your browser only.
4. Pick a target commit and review the release.

Need the tour again? **Replay the tour** at the bottom of the page. Need the
reference? **? How it works** in the header.

## What each step does

| Step                           | What you see                                                           | Why it matters                                    |
| ------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------- |
| **1 · What is live right now** | The deployed SHA, its subject and age                                  | The baseline every diff is measured from          |
| **2 · Choose what to promote** | Commits ahead of the baseline; already-live commits are disabled       | Prevents selecting something that is already out  |
| **3 · Review the scope**       | Commits, files touched, `+`/`−` lines, authors, per-commit impact bars | Shows where the risk of the release actually sits |
| **4 · Pre-flight checklist**   | Five checks, progress bar, one-click release note                      | Turns a gut call into a repeatable hand-over      |

### How the live SHA is detected

GitHub Pages deploys land on the `gh-pages` branch as a fresh commit whose
subject references the source commit:

```
Deploying to gh-pages from @ w-b-dev/oncall-checklist@f8cef4be…330f 🚀
```

The app reads the tip of that branch and parses the 40-character SHA out of the
subject. If your pipeline does not leave such a marker — or the branch does not
exist — the app says so and lets you pick the baseline commit by hand.

### Copy buttons

- **Copy diff link** — the GitHub `compare` URL for the exact range.
- **Copy release note** — a Markdown summary (scope, authors, commit list,
  checklist state) ready to paste into a ticket, a PR or chat.

## Configuration

Settings chosen in the UI live in `localStorage` and win over everything else.
Build-time defaults come from `.env` (see the file for the full list):

```bash
REACT_APP_GITHUB_REPO=owner/repo
REACT_APP_DEPLOY_BRANCH=gh-pages
REACT_APP_GITHUB_TOKEN=          # leave empty for public deployments
```

> A token in `.env` is compiled into the public bundle. For a shared
> deployment, leave it empty and let each user add their own in **Settings**.

## Run it locally

```bash
npm ci
npm start     # http://localhost:3000
npm test      # unit tests
npm run build # production bundle
```

Node 18+ needs `NODE_OPTIONS=--openssl-legacy-provider` for the `react-scripts 4`
webpack build; CI sets it for you.

## Project layout

```
src/
  Api/fetchCommits.tsx        GitHub REST calls + typed error handling
  Components/                 App shell, the four step cards, onboarding & dialogs
  config/repo.ts              Repository config, parsing and persistence
  customHooks/                Deployment state, localStorage state
  Styles/index.css            Design tokens and every component style
  utils/format.ts             SHA/date formatting, bounded-concurrency fetching
```

## Deployment

Pushing to `master` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
install → test → build → publish `build/` to `gh-pages`. Pull requests run
[`.github/workflows/ci.yml`](.github/workflows/ci.yml) (test + build) instead.

## Roadmap

- [ ] Staging deploys for pull requests (feature-branch model, e.g. `staging.codein.ca`)
- [ ] Per-file risk hints (touched migrations, config, CI definitions)
- [ ] Shareable review links that encode the compared range
- [ ] Slack hand-over from the release note

## Done

- [x] Detect the live SHA from the deploy branch marker
- [x] Target commit selector limited to promotable commits
- [x] Commit cards with author avatars, links and relative dates
- [x] Per-commit lines-changed and share-of-release bars
- [x] One-click copy of the GitHub diff link
- [x] Styled background, cards and full responsive layout
- [x] First-run onboarding, in-app guide and repository settings
