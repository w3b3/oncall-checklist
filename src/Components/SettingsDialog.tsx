import React, { useState } from "react";
import { RepoConfig } from "../types";
import { parseRepoInput } from "../config/repo";

interface SettingsDialogProps {
  config: RepoConfig;
  onSave: (config: RepoConfig) => void;
  onClose: () => void;
}

export function SettingsDialog({
  config,
  onSave,
  onClose,
}: SettingsDialogProps): JSX.Element {
  const [repoInput, setRepoInput] = useState(`${config.owner}/${config.repo}`);
  const [deployBranch, setDeployBranch] = useState(config.deployBranch);
  const [token, setToken] = useState(config.token);
  const [error, setError] = useState("");

  const save = () => {
    const parsed = parseRepoInput(repoInput);
    if (!parsed) {
      setError("Use the owner/repo format, e.g. facebook/react");
      return;
    }
    onSave({
      ...parsed,
      deployBranch: deployBranch.trim() || "gh-pages",
      token: token.trim(),
    });
  };

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="modal">
        <h2>Settings</h2>
        <p>Choose which repository and deploy branch this checklist watches.</p>
        <div className="stack" style={{ marginTop: 20 }}>
          <div className="field">
            <label className="field-label" htmlFor="settings-repo">
              Repository
            </label>
            <input
              id="settings-repo"
              className="input"
              value={repoInput}
              placeholder="owner/repo"
              onChange={(event) => setRepoInput(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="settings-branch">
              Deploy branch
            </label>
            <input
              id="settings-branch"
              className="input"
              value={deployBranch}
              onChange={(event) => setDeployBranch(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="settings-token">
              Personal access token (optional)
            </label>
            <input
              id="settings-token"
              className="input mono"
              type="password"
              value={token}
              placeholder="ghp_…"
              onChange={(event) => setToken(event.target.value)}
            />
            <span className="note">
              Kept in this browser only. Clear the field to go back to the
              anonymous 60 requests/hour limit.
            </span>
          </div>
          {error && <div className="alert alert--error">{error}</div>}
        </div>
        <div className="row" style={{ marginTop: 24 }}>
          <div className="spacer" />
          <button className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" onClick={save}>
            Save and reload
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsDialog;
