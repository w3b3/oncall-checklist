import React, { useCallback, useEffect, useMemo, useState } from "react";
import { compareCommits, getCommitStats } from "../Api/fetchCommits";
import BaseCommitDisplay from "./BaseCommitDisplay";
import { ListCommitDiff } from "./ListCommitDiff";
import { CommitSelector } from "./CommitSelector";
import { CHECKLIST, PromoteChecklist } from "./PromoteChecklist";
import Onboarding from "./Onboarding";
import SettingsDialog from "./SettingsDialog";
import HelpDialog from "./HelpDialog";
import { CommitStats, Comparison, RepoConfig } from "../types";
import { useDeployment } from "../customHooks/useDeployedCommit";
import { useLocalStorage } from "../customHooks/useLocalStorage";
import { loadRepoConfig, repoLabel, saveRepoConfig } from "../config/repo";
import { mapWithConcurrency, shortSha, subjectOf } from "../utils/format";

const IMPACT_CONCURRENCY = 4;

function App(): JSX.Element {
  const [config, setConfig] = useState<RepoConfig>(loadRepoConfig);
  const [onboarded, setOnboarded] = useLocalStorage(
    "oncall.onboarded.v1",
    false
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState("");

  const { deployedSHA, log, loading, error, warning, reload } =
    useDeployment(config);

  const [baseOverride, setBaseOverride] = useState("");
  const [showBasePicker, setShowBasePicker] = useState(false);
  const [targetSHA, setTargetSHA] = useState("");

  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState("");

  const [impact, setImpact] = useState<Record<string, CommitStats>>({});
  const [impactLoading, setImpactLoading] = useState(false);

  const [checklistStore, setChecklistStore] = useLocalStorage<
    Record<string, string[]>
  >("oncall.checklist.v1", {});

  const baseSHA = baseOverride || deployedSHA;
  const baseCommit = useMemo(
    () => log.find((entry) => entry.sha === baseSHA),
    [log, baseSHA]
  );
  const ready = Boolean(baseSHA && targetSHA);
  const releaseKey = `${repoLabel(config)}@${shortSha(baseSHA)}..${shortSha(
    targetSHA
  )}`;
  const checked = useMemo(
    () => checklistStore[releaseKey] ?? [],
    [checklistStore, releaseKey]
  );

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  /* A new repository invalidates every selection made against the old one. */
  useEffect(() => {
    setBaseOverride("");
    setTargetSHA("");
    setComparison(null);
    setCompareError("");
    setImpact({});
  }, [config]);

  useEffect(() => {
    setShowBasePicker(!loading && !deployedSHA && !baseOverride);
  }, [loading, deployedSHA, baseOverride]);

  useEffect(() => {
    if (!baseSHA || !targetSHA) {
      setComparison(null);
      return;
    }
    let cancelled = false;
    setComparing(true);
    setCompareError("");
    setImpact({});
    compareCommits(config, baseSHA, targetSHA)
      .then((result) => {
        if (!cancelled) setComparison(result);
      })
      .catch((cause: Error) => {
        if (!cancelled) {
          setComparison(null);
          setCompareError(cause.message);
        }
      })
      .finally(() => {
        if (!cancelled) setComparing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [config, baseSHA, targetSHA]);

  const loadImpact = useCallback(async () => {
    if (!comparison) return;
    setImpactLoading(true);
    try {
      const entries = await mapWithConcurrency(
        comparison.commits,
        IMPACT_CONCURRENCY,
        async (commit) =>
          [commit.sha, await getCommitStats(config, commit.sha)] as const
      );
      setImpact(Object.fromEntries(entries));
    } catch (cause) {
      notify((cause as Error).message);
    } finally {
      setImpactLoading(false);
    }
  }, [comparison, config, notify]);

  const copy = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        notify(label);
      } catch {
        notify("Copy failed — your browser blocked clipboard access");
      }
    },
    [notify]
  );

  const toggleCheck = useCallback(
    (id: string) => {
      const next = checked.includes(id)
        ? checked.filter((entry) => entry !== id)
        : [...checked, id];
      setChecklistStore({ ...checklistStore, [releaseKey]: next });
    },
    [checked, checklistStore, releaseKey, setChecklistStore]
  );

  const copyReleaseNote = useCallback(() => {
    if (!comparison) return;
    const authors = Array.from(
      new Set(
        comparison.commits.map(
          (commit) => commit.authorLogin ?? commit.authorName
        )
      )
    );
    const note = [
      `## Release ${shortSha(baseSHA)} → ${shortSha(targetSHA)} · ${repoLabel(
        config
      )}`,
      "",
      `- **Scope:** ${comparison.commits.length} commits, ${comparison.filesChanged} files, +${comparison.additions}/−${comparison.deletions}`,
      `- **Authors:** ${authors.join(", ") || "n/a"}`,
      `- **Diff:** ${comparison.compareUrl}`,
      "",
      "### Commits",
      ...comparison.commits.map(
        (commit) =>
          `- \`${shortSha(commit.sha)}\` ${subjectOf(commit.message)} — ${
            commit.authorName
          }`
      ),
      "",
      "### Pre-flight",
      ...CHECKLIST.map(
        (item) => `- [${checked.includes(item.id) ? "x" : " "}] ${item.title}`
      ),
    ].join("\n");
    copy(note, "Release note copied");
  }, [comparison, baseSHA, targetSHA, config, checked, copy]);

  const applyConfig = useCallback((next: RepoConfig) => {
    saveRepoConfig(next);
    setConfig(next);
    setShowSettings(false);
  }, []);

  return (
    <>
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              🚦
            </span>
            <div>
              <div className="brand-title">On-Call Checklist</div>
              <div className="brand-sub">{repoLabel(config)}</div>
            </div>
          </div>
          <div className="spacer" />
          <button className="btn btn--ghost btn--sm" onClick={reload}>
            ↻ Refresh
          </button>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setShowHelp(true)}
          >
            ? How it works
          </button>
          <button className="btn btn--sm" onClick={() => setShowSettings(true)}>
            ⚙ Settings
          </button>
        </header>

        <section className="hero">
          <h1>Know what ships before you ship it.</h1>
          <p>
            Compare what is live against what you are about to promote: the full
            commit scope, who owns it, how much code moves, and a pre-flight
            checklist you can hand to the next shift.
          </p>
        </section>

        <div className="stack">
          {error && (
            <div className="alert alert--error">
              {error}{" "}
              <button
                className="btn btn--sm"
                style={{ marginLeft: 8 }}
                onClick={reload}
              >
                Retry
              </button>
            </div>
          )}
          {!error && warning && <div className="alert">{warning}</div>}

          <BaseCommitDisplay
            config={config}
            currentSHA={baseSHA}
            baseCommit={baseCommit}
            loading={loading}
            onChangeBase={() => setShowBasePicker(true)}
          />

          <CommitSelector
            log={log}
            config={config}
            currentSHA={baseSHA}
            targetSHA={targetSHA}
            showBasePicker={showBasePicker}
            onBaseChange={setBaseOverride}
            onTargetChange={setTargetSHA}
          />

          <ListCommitDiff
            config={config}
            comparison={comparison}
            loading={comparing}
            error={compareError}
            impact={impact}
            impactLoading={impactLoading}
            onLoadImpact={loadImpact}
            onCopy={copy}
            ready={ready}
          />

          <PromoteChecklist
            checked={checked}
            onToggle={toggleCheck}
            onCopyNote={copyReleaseNote}
            disabled={!ready || !comparison}
          />
        </div>

        <footer className="footer">
          <span>
            Runs entirely in your browser against the GitHub REST API.
          </span>
          <a
            href={`https://github.com/${repoLabel(config)}`}
            target="_blank"
            rel="noreferrer"
          >
            Repository ↗
          </a>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setOnboarded(false)}
          >
            Replay the tour
          </button>
        </footer>
      </div>

      {!onboarded && (
        <Onboarding
          config={config}
          onFinish={(next) => {
            applyConfig(next);
            setOnboarded(true);
          }}
        />
      )}
      {showSettings && (
        <SettingsDialog
          config={config}
          onSave={applyConfig}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

export default App;
