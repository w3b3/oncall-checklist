import React, { useState } from "react";
import { RepoConfig } from "../types";
import { parseRepoInput } from "../config/repo";

interface OnboardingProps {
  config: RepoConfig;
  onFinish: (config: RepoConfig) => void;
}

const STEPS = 3;

export function Onboarding({ config, onFinish }: OnboardingProps): JSX.Element {
  const [step, setStep] = useState(0);
  const [repoInput, setRepoInput] = useState(`${config.owner}/${config.repo}`);
  const [deployBranch, setDeployBranch] = useState(config.deployBranch);
  const [token, setToken] = useState(config.token);
  const [repoError, setRepoError] = useState("");

  const next = () => {
    if (step === 1 && !parseRepoInput(repoInput)) {
      setRepoError("Use the owner/repo format, e.g. facebook/react");
      return;
    }
    setRepoError("");
    if (step < STEPS - 1) {
      setStep(step + 1);
      return;
    }
    const parsed = parseRepoInput(repoInput);
    onFinish({
      owner: parsed?.owner ?? config.owner,
      repo: parsed?.repo ?? config.repo,
      deployBranch: deployBranch.trim() || "gh-pages",
      token: token.trim(),
    });
  };

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Getting started"
    >
      <div className="modal">
        {step === 0 && (
          <>
            <div className="tour-art">🚦</div>
            <h2>Know exactly what you are about to ship</h2>
            <p>
              On-Call Checklist sits between your last deploy and the commit you
              are about to promote. It shows the exact scope of the change, who
              owns each commit, and how much code moves — before you press the
              button.
            </p>
            <div className="stack" style={{ gap: 0, marginTop: 18 }}>
              <div className="guide-item">
                <span className="guide-num">1</span>
                <div>
                  <div className="check-title">Read the live SHA</div>
                  <div className="check-desc">
                    Detected automatically from your deploy branch.
                  </div>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-num">2</span>
                <div>
                  <div className="check-title">Pick the target commit</div>
                  <div className="check-desc">
                    Anything ahead of what is already live.
                  </div>
                </div>
              </div>
              <div className="guide-item">
                <span className="guide-num">3</span>
                <div>
                  <div className="check-title">Review and sign off</div>
                  <div className="check-desc">
                    Commit-by-commit diff, impact per author, and a pre-flight
                    checklist you can hand over.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="tour-art">📦</div>
            <h2>Point it at a repository</h2>
            <p>
              Any public GitHub repository works. Everything stays in your
              browser — nothing is sent to a server of ours.
            </p>
            <div className="stack" style={{ marginTop: 18 }}>
              <div className="field">
                <label className="field-label" htmlFor="onboarding-repo">
                  Repository
                </label>
                <input
                  id="onboarding-repo"
                  className="input"
                  value={repoInput}
                  placeholder="owner/repo"
                  autoFocus
                  onChange={(event) => setRepoInput(event.target.value)}
                />
                {repoError && (
                  <span className="note" style={{ color: "var(--red)" }}>
                    {repoError}
                  </span>
                )}
              </div>
              <div className="field">
                <label className="field-label" htmlFor="onboarding-branch">
                  Deploy branch
                </label>
                <input
                  id="onboarding-branch"
                  className="input"
                  value={deployBranch}
                  placeholder="gh-pages"
                  onChange={(event) => setDeployBranch(event.target.value)}
                />
                <span className="note">
                  The branch your CI publishes to. We read its latest commit to
                  work out what is live right now. Not using one? Leave it as is
                  and pick the baseline manually later.
                </span>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="tour-art">🔑</div>
            <h2>Optional: raise your API limit</h2>
            <p>
              Without a token GitHub allows 60 requests per hour. A read-only
              personal access token raises that to 5,000 and unlocks private
              repositories.
            </p>
            <div className="field" style={{ marginTop: 18 }}>
              <label className="field-label" htmlFor="onboarding-token">
                Personal access token
              </label>
              <input
                id="onboarding-token"
                className="input mono"
                type="password"
                value={token}
                placeholder="ghp_… (optional)"
                onChange={(event) => setToken(event.target.value)}
              />
              <span className="note">
                Stored only in this browser&apos;s local storage and sent
                straight to api.github.com. Create one at{" "}
                <a
                  href="https://github.com/settings/tokens?type=beta"
                  target="_blank"
                  rel="noreferrer"
                >
                  github.com/settings/tokens
                </a>{" "}
                with read-only repository access.
              </span>
            </div>
          </>
        )}

        <div className="row" style={{ marginTop: 26 }}>
          <div className="dots" aria-hidden="true">
            {Array.from({ length: STEPS }, (_, index) => (
              <span key={index} className={index === step ? "on" : ""} />
            ))}
          </div>
          <div className="spacer" />
          {step > 0 && (
            <button
              className="btn btn--ghost"
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          )}
          <button className="btn btn--primary" onClick={next}>
            {step === STEPS - 1 ? "Start reviewing" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
