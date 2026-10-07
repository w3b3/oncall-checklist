import React from "react";
import { Commit, CommitStats, Comparison, RepoConfig } from "../types";
import { initials, relativeTime, shortSha, subjectOf } from "../utils/format";

interface ListCommitDiffProps {
  config: RepoConfig;
  comparison: Comparison | null;
  loading: boolean;
  error: string;
  impact: Record<string, CommitStats>;
  impactLoading: boolean;
  onLoadImpact: () => void;
  onCopy: (text: string, label: string) => void;
  ready: boolean;
}

const Avatar = ({ commit }: { commit: Commit }) =>
  commit.avatarUrl ? (
    <img
      className="avatar"
      src={commit.avatarUrl}
      alt={commit.authorName}
      loading="lazy"
    />
  ) : (
    <span className="avatar" aria-hidden="true">
      {initials(commit.authorName)}
    </span>
  );

export function ListCommitDiff({
  config,
  comparison,
  loading,
  error,
  impact,
  impactLoading,
  onLoadImpact,
  onCopy,
  ready,
}: ListCommitDiffProps): JSX.Element {
  const commits = comparison?.commits ?? [];
  const largestCommit = Math.max(
    1,
    ...commits.map((commit) => {
      const stats = impact[commit.sha];
      return stats ? stats.additions + stats.deletions : 0;
    })
  );
  const totalChurn = Math.max(
    1,
    (comparison?.additions ?? 0) + (comparison?.deletions ?? 0)
  );

  return (
    <section className="card card--step">
      <div className="card-head">
        <span
          className={`step-badge ${commits.length ? "step-badge--done" : ""}`}
        >
          3
        </span>
        <div style={{ flex: 1 }}>
          <div className="row">
            <h2 className="card-title">Review the scope</h2>
            {comparison && (
              <a
                className="pill"
                href={comparison.compareUrl}
                target="_blank"
                rel="noreferrer"
              >
                open diff on GitHub ↗
              </a>
            )}
          </div>
          <p className="card-hint">
            Every commit that ships if you promote this target — newest first.
          </p>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {loading && (
        <div className="stack" style={{ gap: 10 }}>
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      )}

      {!loading && !error && !ready && (
        <div className="empty">
          Pick a baseline and a target commit to see the release scope.
        </div>
      )}

      {!loading && !error && ready && comparison && commits.length === 0 && (
        <div className="empty">
          No commits between these two points — nothing would ship.
        </div>
      )}

      {!loading && !error && comparison && commits.length > 0 && (
        <>
          <div className="stats" style={{ marginBottom: 16 }}>
            <div className="stat">
              <div className="stat-value">{commits.length}</div>
              <div className="stat-label">commits</div>
            </div>
            <div className="stat">
              <div className="stat-value">{comparison.filesChanged}</div>
              <div className="stat-label">files touched</div>
            </div>
            <div className="stat">
              <div className="stat-value add">+{comparison.additions}</div>
              <div className="stat-label">added</div>
            </div>
            <div className="stat">
              <div className="stat-value del">−{comparison.deletions}</div>
              <div className="stat-label">removed</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {new Set(commits.map((commit) => commit.authorName)).size}
              </div>
              <div className="stat-label">authors</div>
            </div>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <button
              className="btn btn--sm"
              onClick={() =>
                onCopy(comparison.compareUrl, "Compare link copied")
              }
            >
              🔗 Copy diff link
            </button>
            <button
              className="btn btn--sm"
              disabled={impactLoading || Object.keys(impact).length > 0}
              onClick={onLoadImpact}
            >
              {impactLoading
                ? "Measuring…"
                : Object.keys(impact).length > 0
                ? "✓ Impact loaded"
                : "📊 Load per-commit impact"}
            </button>
            <span className="note">
              {Object.keys(impact).length > 0
                ? "Bars show each commit's share of the release."
                : `${commits.length} extra API call${
                    commits.length === 1 ? "" : "s"
                  }`}
            </span>
          </div>

          <ol className="commit-list">
            {commits.map((commit, index) => {
              const stats = impact[commit.sha];
              const churn = stats ? stats.additions + stats.deletions : 0;
              const share = Math.round((churn / totalChurn) * 100);
              return (
                <li
                  className="commit"
                  key={commit.sha}
                  style={{ animationDelay: `${Math.min(index * 35, 350)}ms` }}
                >
                  <a
                    href={`https://github.com/${
                      commit.authorLogin ?? config.owner
                    }`}
                    target="_blank"
                    rel="noreferrer"
                    title={commit.authorName}
                  >
                    <Avatar commit={commit} />
                  </a>
                  <div>
                    <div className="commit-subject">
                      {subjectOf(commit.message)}
                    </div>
                    <div className="commit-meta">
                      <a
                        className="sha"
                        href={commit.url}
                        target="_blank"
                        rel="noreferrer"
                        title={commit.sha}
                      >
                        {shortSha(commit.sha)}
                      </a>
                      <span>{commit.authorName}</span>
                      <span>{relativeTime(commit.date)}</span>
                      {stats && (
                        <span className="mono">
                          <span className="add">+{stats.additions}</span>{" "}
                          <span className="del">−{stats.deletions}</span>
                        </span>
                      )}
                    </div>
                    {stats && (
                      <div className="impact-bar">
                        <span className="impact-track">
                          <span
                            className="impact-fill impact-fill--add"
                            style={{
                              width: `${
                                (stats.additions / largestCommit) * 100
                              }%`,
                            }}
                          />
                          <span
                            className="impact-fill impact-fill--del"
                            style={{
                              width: `${
                                (stats.deletions / largestCommit) * 100
                              }%`,
                            }}
                          />
                        </span>
                        <span className="impact-label">
                          {share}% of release
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}

export default ListCommitDiff;
