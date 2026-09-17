import React from "react";

const STEPS = [
  {
    title: "Check what is live",
    body: "The baseline is read from the tip of your deploy branch. The GitHub Pages action writes the source SHA into its commit subject, so the live commit can be recovered exactly. If that marker is missing, pick a baseline commit by hand.",
  },
  {
    title: "Choose the target",
    body: "Only commits ahead of the baseline can be promoted — everything already live is disabled in the list. Picking the newest commit is the common case; pick an older one to ship a smaller slice.",
  },
  {
    title: "Review the scope",
    body: "Each commit is a card: author, age, message, lines changed, and a link to the diff on GitHub. Load per-commit impact to see which commit carries the weight of the release.",
  },
  {
    title: "Run the pre-flight checklist",
    body: "Five checks that catch the usual on-call surprises. Progress is saved per release, so a handover mid-shift does not lose the state.",
  },
  {
    title: "Hand it over",
    body: "Copy the compare link for a reviewer, or copy the release note — a Markdown summary with scope, authors and checklist state, ready to paste into a ticket or chat.",
  },
];

export function HelpDialog({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="How it works"
    >
      <div className="modal">
        <h2>How it works</h2>
        <p>
          A five-step routine for deciding whether a release is safe to promote.
        </p>
        <div className="stack" style={{ gap: 0, marginTop: 18 }}>
          {STEPS.map((step, index) => (
            <div className="guide-item" key={step.title}>
              <span className="guide-num">{index + 1}</span>
              <div>
                <div className="check-title">{step.title}</div>
                <div className="check-desc">{step.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 24 }}>
          <span className="note">
            Everything runs in your browser against the public GitHub API.
          </span>
          <div className="spacer" />
          <button className="btn btn--primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default HelpDialog;
