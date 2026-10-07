import React from "react";
import { Commit, RepoConfig } from "../types";
import { relativeTime, shortSha, subjectOf } from "../utils/format";
import { repoLabel } from "../config/repo";

interface BaseCommitDisplayProps {
  config: RepoConfig;
  currentSHA: string;
  baseCommit?: Commit;
  loading: boolean;
  onChangeBase: () => void;
}

function BaseCommitDisplay({
  config,
  currentSHA,
  baseCommit,
  loading,
  onChangeBase,
}: BaseCommitDisplayProps): JSX.Element {
  return (
    <section className="card card--step">
      <div className="card-head">
        <span className={`step-badge ${currentSHA ? "step-badge--done" : ""}`}>
          1
        </span>
        <div style={{ flex: 1 }}>
          <div className="row">
            <h2 className="card-title">What is live right now</h2>
            {currentSHA && (
              <span className="pill pill--live">
                <span className="dot" />
                deployed
              </span>
            )}
          </div>
          <p className="card-hint">
            Read from the tip of <code>{config.deployBranch}</code> in{" "}
            <a
              href={`https://github.com/${repoLabel(config)}`}
              target="_blank"
              rel="noreferrer"
            >
              {repoLabel(config)}
            </a>
            . This is the baseline every diff below is measured from.
          </p>
        </div>
      </div>

      {loading && <div className="skeleton" />}

      {!loading && currentSHA && (
        <div className="row" style={{ gap: 12 }}>
          <a
            className="sha sha--base"
            href={`https://github.com/${repoLabel(
              config
            )}/commit/${currentSHA}`}
            target="_blank"
            rel="noreferrer"
            title={currentSHA}
          >
            {shortSha(currentSHA)}
          </a>
          <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {baseCommit ? subjectOf(baseCommit.message) : "baseline commit"}
          </span>
          {baseCommit?.date && (
            <span className="note">{relativeTime(baseCommit.date)}</span>
          )}
          <div className="spacer" />
          <button className="btn btn--ghost btn--sm" onClick={onChangeBase}>
            Change baseline
          </button>
        </div>
      )}

      {!loading && !currentSHA && (
        <div className="empty">
          No baseline yet — pick the commit that is currently live from the list
          below.
        </div>
      )}
    </section>
  );
}

export const MemoizedBaseCommitDisplay = React.memo(BaseCommitDisplay);
export default MemoizedBaseCommitDisplay;
