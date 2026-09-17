import { RepoConfig } from "../types";

const STORAGE_KEY = "oncall.repo.v1";

/*
 * Defaults can be baked in at build time (see .env) so a team deployment opens
 * on the right repository; the UI still lets anyone point it elsewhere.
 */
const envRepo = (process.env.REACT_APP_GITHUB_REPO ?? "").split("/");

export const DEFAULT_REPO: RepoConfig = {
  owner: envRepo[0] || "w-b-dev",
  repo: envRepo[1] || "oncall-checklist",
  deployBranch: process.env.REACT_APP_DEPLOY_BRANCH || "gh-pages",
  token: process.env.REACT_APP_GITHUB_TOKEN ?? "",
};

/** Accepts "owner/repo", a full GitHub URL, or a bare repo name. */
export const parseRepoInput = (
  input: string
): { owner: string; repo: string } | null => {
  const cleaned = input
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/\/+$/, "");
  const match = cleaned.match(/^([\w.-]+)\/([\w.-]+)$/);
  return match ? { owner: match[1], repo: match[2] } : null;
};

export const loadRepoConfig = (): RepoConfig => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REPO;
    return { ...DEFAULT_REPO, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REPO;
  }
};

export const saveRepoConfig = (config: RepoConfig): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* storage disabled — the app still works for this session */
  }
};

export const repoLabel = (config: RepoConfig): string =>
  `${config.owner}/${config.repo}`;
