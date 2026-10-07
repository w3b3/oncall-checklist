import { Commit, CommitStats, Comparison, RepoConfig } from "../types";

const API_ROOT = "https://api.github.com";

export class GithubError extends Error {
  readonly status: number;
  readonly rateLimited: boolean;

  constructor(message: string, status: number, rateLimited = false) {
    super(message);
    this.name = "GithubError";
    this.status = status;
    this.rateLimited = rateLimited;
  }
}

const authHeaders = (token: string): HeadersInit => ({
  Accept: "application/vnd.github.v3+json",
  ...(token ? { Authorization: `Bearer ${token.trim()}` } : {}),
});

/*
 * fetch() only rejects on network errors, never on 404/403 — so every HTTP
 * status is turned into a GithubError the UI can explain to the on-call.
 */
const request = async <T,>(path: string, { token }: RepoConfig): Promise<T> => {
  const response = await fetch(API_ROOT + path, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const rateLimited = response.status === 403 && remaining === "0";
    let detail = "";
    try {
      detail = ((await response.json()) as { message?: string }).message ?? "";
    } catch {
      /* non-JSON error body */
    }
    if (rateLimited) {
      throw new GithubError(
        "GitHub API rate limit reached. Add a personal access token in Settings to raise the limit from 60 to 5,000 requests per hour.",
        response.status,
        true
      );
    }
    if (response.status === 404) {
      throw new GithubError(
        `Not found: ${path}. Check the repository name — private repositories need a token.`,
        404
      );
    }
    throw new GithubError(
      detail || `GitHub responded with ${response.status}.`,
      response.status
    );
  }

  return response.json() as Promise<T>;
};

interface RawCommit {
  sha: string;
  html_url: string;
  commit: { message: string; author: { name: string; date: string } | null };
  author: { login: string; avatar_url: string } | null;
}

const toCommit = (raw: RawCommit): Commit => ({
  sha: raw.sha,
  message: raw.commit.message,
  authorName: raw.commit.author?.name ?? raw.author?.login ?? "unknown",
  authorLogin: raw.author?.login,
  avatarUrl: raw.author?.avatar_url,
  date: raw.commit.author?.date ?? "",
  url: raw.html_url,
});

export const getCommits = async (
  config: RepoConfig,
  branchOrSHA?: string,
  perPage = 50
): Promise<Commit[]> => {
  const query = new URLSearchParams({ per_page: String(perPage) });
  if (branchOrSHA) query.set("sha", branchOrSHA);
  const raw = await request<RawCommit[]>(
    `/repos/${config.owner}/${config.repo}/commits?${query}`,
    config
  );
  return raw.map(toCommit);
};

/*
 * The GitHub Pages deploy action commits to `gh-pages` with a subject like
 *   "Deploying to gh-pages from @ owner/repo@<sha> 🚀"
 * so the live SHA can be read straight off that branch's tip.
 */
export const DEPLOY_SHA_PATTERN = /@\s*([0-9a-f]{40})/i;

export const extractDeployedSha = (message: string): string => {
  const tagged = message.match(DEPLOY_SHA_PATTERN);
  if (tagged) return tagged[1];
  const bare = message.match(/\b[0-9a-f]{40}\b/i);
  return bare ? bare[0] : "";
};

export const getDeployedCommit = async (
  config: RepoConfig
): Promise<string> => {
  const commits = await getCommits(config, config.deployBranch, 10);
  for (const commit of commits) {
    const sha = extractDeployedSha(commit.message);
    if (sha) return sha;
  }
  return "";
};

interface RawComparison {
  html_url: string;
  commits: RawCommit[];
  files?: { additions: number; deletions: number }[];
}

export const compareCommits = async (
  config: RepoConfig,
  base: string,
  head: string
): Promise<Comparison> => {
  const raw = await request<RawComparison>(
    `/repos/${config.owner}/${config.repo}/compare/${base}...${head}`,
    config
  );
  const files = raw.files ?? [];
  return {
    commits: raw.commits.map(toCommit).reverse(), // newest first
    compareUrl: raw.html_url,
    filesChanged: files.length,
    additions: files.reduce((sum, file) => sum + file.additions, 0),
    deletions: files.reduce((sum, file) => sum + file.deletions, 0),
  };
};

export const getCommitStats = async (
  config: RepoConfig,
  sha: string
): Promise<CommitStats> => {
  const raw = await request<{ stats?: CommitStats }>(
    `/repos/${config.owner}/${config.repo}/commits/${sha}`,
    config
  );
  return {
    additions: raw.stats?.additions ?? 0,
    deletions: raw.stats?.deletions ?? 0,
  };
};
