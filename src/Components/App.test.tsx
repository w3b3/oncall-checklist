import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

const commit = (sha: string, message: string) => ({
  sha,
  html_url: `https://github.com/w-b-dev/oncall-checklist/commit/${sha}`,
  commit: { message, author: { name: "ada", date: new Date().toISOString() } },
  author: { login: "ada", avatar_url: "https://example.test/ada.png" },
});

const LIVE_SHA = "a".repeat(40);

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem("oncall.onboarded.v1", "true");
  jest.spyOn(global, "fetch").mockImplementation((input) => {
    const url = String(input);
    const body = url.includes("sha=gh-pages")
      ? [
          commit(
            "b".repeat(40),
            `Deploying to gh-pages from @ w-b-dev/oncall-checklist@${LIVE_SHA} 🚀`
          ),
        ]
      : [
          commit("c".repeat(40), "newest work"),
          commit(LIVE_SHA, "live commit"),
        ];
    return Promise.resolve({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: () => Promise.resolve(body),
    } as Response);
  });
});

afterEach(() => jest.restoreAllMocks());

test("shows the live SHA parsed from the deploy branch", async () => {
  render(<App />);
  await waitFor(() =>
    expect(screen.getAllByText(LIVE_SHA.slice(0, 7)).length).toBeGreaterThan(0)
  );
});

test("counts the commits waiting to be promoted", async () => {
  render(<App />);
  expect(await screen.findByText(/1 commit waiting/i)).toBeInTheDocument();
});

test("skips onboarding once it has been completed", async () => {
  render(<App />);
  expect(screen.queryByLabelText(/getting started/i)).not.toBeInTheDocument();
  // let the initial GitHub calls settle so React state lands inside act()
  await screen.findByText(/1 commit waiting/i);
});
