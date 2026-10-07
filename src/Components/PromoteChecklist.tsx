import React from "react";

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
}

export const CHECKLIST: ChecklistItem[] = [
  {
    id: "scope",
    title: "Scope read end to end",
    description:
      "Every commit in the list above was reviewed, not just the top one.",
  },
  {
    id: "owners",
    title: "Authors reachable",
    description:
      "Everyone whose commit ships is around — or someone can speak for it.",
  },
  {
    id: "data",
    title: "Migrations, config and flags",
    description:
      "Schema changes, new env vars and feature flags are applied and safe to roll back.",
  },
  {
    id: "rollback",
    title: "Rollback path known",
    description:
      "The previous good SHA is noted and the revert takes minutes, not hours.",
  },
  {
    id: "watch",
    title: "Eyes on the deploy",
    description:
      "Dashboards and alerts are open for the window after the promotion.",
  },
];

interface PromoteChecklistProps {
  checked: string[];
  onToggle: (id: string) => void;
  onCopyNote: () => void;
  disabled: boolean;
}

export function PromoteChecklist({
  checked,
  onToggle,
  onCopyNote,
  disabled,
}: PromoteChecklistProps): JSX.Element {
  const done = CHECKLIST.filter((item) => checked.includes(item.id)).length;
  const percent = Math.round((done / CHECKLIST.length) * 100);
  const complete = done === CHECKLIST.length;

  return (
    <section className="card card--step">
      <div className="card-head">
        <span className={`step-badge ${complete ? "step-badge--done" : ""}`}>
          4
        </span>
        <div style={{ flex: 1 }}>
          <div className="row">
            <h2 className="card-title">Pre-flight checklist</h2>
            {complete && (
              <span className="pill pill--live">ready to promote</span>
            )}
          </div>
          <p className="card-hint">
            Saved per release in this browser, so a mid-shift handover keeps the
            state.
          </p>
        </div>
      </div>

      {disabled ? (
        <div className="empty">
          The checklist unlocks once a target commit is selected.
        </div>
      ) : (
        <>
          <div className="row" style={{ marginBottom: 14, gap: 14 }}>
            <span className="progress-track" style={{ flex: 1 }}>
              <span
                className="progress-fill"
                style={{ width: `${percent}%` }}
              />
            </span>
            <span
              className="mono"
              style={{ fontSize: 13, color: "var(--text-muted)" }}
            >
              {done}/{CHECKLIST.length}
            </span>
          </div>

          <div className="stack" style={{ gap: 9 }}>
            {CHECKLIST.map((item) => {
              const on = checked.includes(item.id);
              return (
                <label
                  className={`check ${on ? "check--on" : ""}`}
                  key={item.id}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => onToggle(item.id)}
                  />
                  <span className="check-box" aria-hidden="true">
                    ✓
                  </span>
                  <span>
                    <span className="check-title">{item.title}</span>
                    <span className="check-desc" style={{ display: "block" }}>
                      {item.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn btn--primary" onClick={onCopyNote}>
              📋 Copy release note
            </button>
            <span className="note">
              Markdown summary of scope, authors and checklist state.
            </span>
          </div>
        </>
      )}
    </section>
  );
}

export default PromoteChecklist;
