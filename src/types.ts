export interface Commit {
  sha: string;
  message: string;
  authorName: string;
  authorLogin?: string;
  avatarUrl?: string;
  date: string;
  url: string;
}

export interface CommitStats {
  additions: number;
  deletions: number;
}

export interface Comparison {
  commits: Commit[];
  filesChanged: number;
  additions: number;
  deletions: number;
  compareUrl: string;
}

export interface RepoConfig {
  owner: string;
  repo: string;
  deployBranch: string;
  token: string;
}

/** Kept for the legacy shape used by the commit list. */
export interface Log {
  log: Commit[];
}
