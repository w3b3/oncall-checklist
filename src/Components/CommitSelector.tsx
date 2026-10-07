import React from "react";
import { Commit, RepoConfig } from "../types";
import { relativeTime, shortSha, subjectOf } from "../utils/format";

interface CommitSelectorProps {
  log: Commit[];
  config: RepoConfig;
  currentSHA: string;
  targetSHA: string;
  showBasePicker: boolean;
  onBaseChange: (sha: string) => void;
  onTargetChange: (sha: string) => void;
}

const optionLabel = (commit: Commit): string =>
  `${shortSha(commit.sha)}  ·  ${subjectOf(commit.message).slice(0, 62)}`;

export function CommitSelector({
  log,
  config,
  currentSHA,
  targetSHA,
  showBasePicker,
  onBaseChange,
  onTargetChange,
}: CommitSelectorProps): JSX.Element {
  // The log arrives newest first, so "ahead of the baseline" means a lower index.
  const baseIndex = log.findIndex((entry) => entry.sha === currentSHA);
  const promotable = baseIndex === -1 ? log : log.slice(0, baseIndex);
  const selected = log.find((entry) => entry.sha === targetSHA);
  const newest = promotable[0];

  return (
    <section className="card card--step">
      <div className="card-head">
        <span className={`step-badge ${targetSHA ? "step-badge--done" : ""}`}>
          2
        </span>
        <div style={{ flex: 1 }}>
          <div className="row">
            <h2 className="card-title">Choose what to promote</h2>
            {baseIndex !== -1 && (
              <span className={`pill ${promotable.length ? "pill--warn" : ""}`}>
                {promotable.length === 0
                  ? "up to date"
                  : `${promotable.length} commit${
                      promotable.length === 1 ? "" : "s"
                    } waiting`}
              </span>
            )}
          </div>
          <p className="card-hint">
            Commits already live are disabled. Pick the newest to ship
            everything, or an earlier one to release a smaller slice.
          </p>
        </div>
      </div>

      {showBasePicker && (
        <div className="field" style={{ marginBottom: 14 }}>
          <label className="field-label" htmlFor="baseSHA">
            Baseline (what is live)
          </label>
          <select
            className="select"
            id="baseSHA"
            value={currentSHA}
            onChange={(event) => onBaseChange(event.target.value)}
          >
            <option value="">— select the live commit —</option>
            {log.map((entry) => (
              <option key={entry.sha} value={entry.sha}>
                {optionLabel(entry)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label className="field-label" htmlFor="targetSHA">
          Target commit
        </label>
        <select
          className="select"
          id="targetSHA"
          name="targetSHA"
          value={targetSHA}
          disabled={log.length === 0}
          onChange={(event) => onTargetChange(event.target.value)}
        >
          <option value="">— list of commits —</option>
          {log.map((entry, index) => (
            <option
              key={entry.sha}
              value={entry.sha}
              disabled={baseIndex !== -1 && index >= baseIndex}
            >
              {optionLabel(entry)}
            </option>
          ))}
        </select>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        {selected ? (
          <span style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
            <a
              className="sha"
              href={`https://github.com/${config.owner}/${config.repo}/commit/${selected.sha}`}
              target="_blank"
              rel="noreferrer"
            >
              {shortSha(selected.sha)}
            </a>{" "}
            {subjectOf(selected.message)}{" "}
            <span className="note">{relativeTime(selected.date)}</span>
          </span>
        ) : (
          <span className="note">
            {promotable.length === 0 && baseIndex !== -1
              ? "Nothing to promote — the deploy branch is already at the tip."
              : "Nothing selected yet."}
          </span>
        )}
        <div className="spacer" />
        {newest && newest.sha !== targetSHA && (
          <button
            className="btn btn--sm"
            onClick={() => onTargetChange(newest.sha)}
          >
            ⚡ Select latest
          </button>
        )}
      </div>
    </section>
  );
}

export default CommitSelector;
