import { Commit } from "../types";

const GITHUB_PAGES_BRANCH = "gh-pages";

export const getCommits = async (branchOrSHA?: string): Promise<Commit[]> => {
  const res = await fetchFromGithub(branchOrSHA);
  return res
    .map((entry: { sha: string; commit: { message: string } }) => ({
      sha: entry.sha,
      message: entry.commit.message,
    }))
    .reverse();
};

export const getDeployedCommit = async () => {
  return await getCommits(GITHUB_PAGES_BRANCH).then((res) =>
    res.reverse().find((commit) => commit.message.search(/@\d/))
  );
};

const fetchFromGithub = async (branchOrSHA?: string) => {
  const ifBranchOrSHAProvided = branchOrSHA
    ? `?${new URLSearchParams({
        sha: branchOrSHA,
      })}`
    : "";
  const response = await fetch(
    "https://api.github.com/repos/w-b-dev/oncall-checklist/commits" +
      ifBranchOrSHAProvided
  );
  /*
   * A fetch() promise only rejects when a network error is encountered (which is usually when there’s a permissions issue or similar). A fetch() promise does not reject on HTTP errors (404, etc.). Instead, a then() handler must check the Response.ok and/or Response.status properties.
   * */
  return response.json();
};
