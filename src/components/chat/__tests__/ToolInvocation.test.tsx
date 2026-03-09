import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocation } from "../ToolInvocation";

afterEach(() => {
  cleanup();
});

// --- str_replace_editor: complete state (past tense) ---

test("ToolInvocation displays 'Created' for create command when complete", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/App.jsx" }}
    />
  );
  expect(screen.getByText("Created App.jsx")).toBeDefined();
});

test("ToolInvocation displays 'Edited' for str_replace command when complete", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "str_replace", path: "/components/Button.tsx" }}
    />
  );
  expect(screen.getByText("Edited Button.tsx")).toBeDefined();
});

test("ToolInvocation displays 'Edited' for insert command when complete", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "insert", path: "/utils/helper.js" }}
    />
  );
  expect(screen.getByText("Edited helper.js")).toBeDefined();
});

test("ToolInvocation displays 'Viewed' for view command when complete", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "view", path: "/config.json" }}
    />
  );
  expect(screen.getByText("Viewed config.json")).toBeDefined();
});

test("ToolInvocation displays 'Undid changes' for undo_edit command when complete", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "undo_edit", path: "/index.ts" }}
    />
  );
  expect(screen.getByText("Undid changes to index.ts")).toBeDefined();
});

// --- str_replace_editor: pending state (progressive tense) ---

test("ToolInvocation displays 'Creating' for create command when pending", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="pending"
      args={{ command: "create", path: "/App.jsx" }}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolInvocation displays 'Editing' for str_replace command when pending", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="pending"
      args={{ command: "str_replace", path: "/App.jsx" }}
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("ToolInvocation displays 'Viewing' for view command when pending", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="pending"
      args={{ command: "view", path: "/App.jsx" }}
    />
  );
  expect(screen.getByText("Viewing App.jsx")).toBeDefined();
});

// --- file_manager: complete state ---

test("ToolInvocation displays 'Renamed' for rename command when complete", () => {
  render(
    <ToolInvocation
      toolName="file_manager"
      state="result"
      args={{ command: "rename", path: "/OldComponent.tsx", new_path: "/NewComponent.tsx" }}
    />
  );
  expect(screen.getByText("Renamed OldComponent.tsx to NewComponent.tsx")).toBeDefined();
});

test("ToolInvocation displays 'Deleted' for delete command when complete", () => {
  render(
    <ToolInvocation
      toolName="file_manager"
      state="result"
      args={{ command: "delete", path: "/temp.txt" }}
    />
  );
  expect(screen.getByText("Deleted temp.txt")).toBeDefined();
});

// --- file_manager: pending state ---

test("ToolInvocation displays 'Renaming' for rename command when pending", () => {
  render(
    <ToolInvocation
      toolName="file_manager"
      state="pending"
      args={{ command: "rename", path: "/OldComponent.tsx", new_path: "/NewComponent.tsx" }}
    />
  );
  expect(screen.getByText("Renaming OldComponent.tsx to NewComponent.tsx")).toBeDefined();
});

test("ToolInvocation displays 'Deleting' for delete command when pending", () => {
  render(
    <ToolInvocation
      toolName="file_manager"
      state="pending"
      args={{ command: "delete", path: "/temp.txt" }}
    />
  );
  expect(screen.getByText("Deleting temp.txt")).toBeDefined();
});

// --- UI indicators ---

test("ToolInvocation shows loading spinner when pending", () => {
  const { container } = render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="pending"
      args={{ command: "create", path: "/App.jsx" }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolInvocation shows green dot when complete", () => {
  const { container } = render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/App.jsx" }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

// --- Edge cases ---

test("ToolInvocation uses 'a file' fallback when path is undefined", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="pending"
      args={{ command: "create", path: undefined }}
    />
  );
  expect(screen.getByText("Creating a file")).toBeDefined();
});

test("ToolInvocation handles unknown tool name by humanising it", () => {
  render(<ToolInvocation toolName="unknown_tool" state="result" />);
  expect(screen.getByText("unknown tool")).toBeDefined();
});

test("ToolInvocation handles missing args by falling back to humanised tool name", () => {
  render(<ToolInvocation toolName="str_replace_editor" state="result" />);
  expect(screen.getByText("str replace editor")).toBeDefined();
});

test("ToolInvocation extracts filename from nested path", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/src/components/ui/Button.tsx" }}
    />
  );
  expect(screen.getByText("Created Button.tsx")).toBeDefined();
});

test("ToolInvocation handles paths without extension", () => {
  render(
    <ToolInvocation
      toolName="str_replace_editor"
      state="result"
      args={{ command: "view", path: "/Dockerfile" }}
    />
  );
  expect(screen.getByText("Viewed Dockerfile")).toBeDefined();
});
