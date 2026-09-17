import { useCallback, useEffect, useState } from "react";
import { getCommits, getDeployedCommit } from "../Api/fetchCommits";
import { Commit, RepoConfig } from "../types";

export { DEPLOY_SHA_PATTERN } from "../Api/fetchCommits";

export interface DeploymentState {
  /** SHA currently live, parsed from the deploy branch tip. */
  deployedSHA: string;
  /** Recent commits on the default branch, newest first. */
  log: Commit[];
  loading: boolean;
  error: string;
  /** Set when the repo loads but no deploy marker could be parsed. */
  warning: string;
  reload: () => void;
}

export const useDeployment = (config: RepoConfig): DeploymentState => {
  const [deployedSHA, setDeployedSHA] = useState("");
  const [log, setLog] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setWarning("");

    const load = async () => {
      const commits = await getCommits(config);
      if (cancelled) return;
      setLog(commits);

      try {
        const sha = await getDeployedCommit(config);
        if (cancelled) return;
        setDeployedSHA(sha);
        if (!sha) {
          setWarning(
            `No deploy marker found on "${config.deployBranch}". Pick the baseline commit manually below.`
          );
        }
      } catch {
        if (cancelled) return;
        setDeployedSHA("");
        setWarning(
          `Branch "${config.deployBranch}" is unreachable. Pick the baseline commit manually below.`
        );
      }
    };

    load()
      .catch((cause: Error) => {
        if (!cancelled) setError(cause.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [config, nonce]);

  return { deployedSHA, log, loading, error, warning, reload };
};

/** Legacy helper kept for callers that only need the live SHA. */
export const useDeployedCommit = (config: RepoConfig): string =>
  useDeployment(config).deployedSHA;
