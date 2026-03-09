import { Loader2 } from "lucide-react";

type StrReplaceArgs = {
  command: "view" | "create" | "str_replace" | "insert" | "undo_edit";
  path?: string;
};

type FileManagerArgs = {
  command: "rename" | "delete";
  path?: string;
  new_path?: string;
};

type ToolArgs = StrReplaceArgs | FileManagerArgs | Record<string, unknown>;

interface ToolInvocationProps {
  toolName: string;
  state: string;
  args?: ToolArgs;
}

function fileName(path?: string): string {
  if (!path) return "a file";
  return path.split("/").pop() || path;
}

function tense(pending: string, complete: string, isComplete: boolean): string {
  return isComplete ? complete : pending;
}

function getToolMessage(toolName: string, state: string, args?: ToolArgs): string {
  const isComplete = state === "result";

  if (toolName === "str_replace_editor" && args) {
    const { command, path } = args as StrReplaceArgs;
    const name = fileName(path);
    switch (command) {
      case "create":
        return tense(`Creating ${name}`, `Created ${name}`, isComplete);
      case "str_replace":
      case "insert":
        return tense(`Editing ${name}`, `Edited ${name}`, isComplete);
      case "view":
        return tense(`Viewing ${name}`, `Viewed ${name}`, isComplete);
      case "undo_edit":
        return tense(`Undoing changes to ${name}`, `Undid changes to ${name}`, isComplete);
      default:
        return tense(`Updating ${name}`, `Updated ${name}`, isComplete);
    }
  }

  if (toolName === "file_manager" && args) {
    const { command, path, new_path } = args as FileManagerArgs;
    const name = fileName(path);
    switch (command) {
      case "rename": {
        const newName = fileName(new_path);
        return tense(`Renaming ${name} to ${newName}`, `Renamed ${name} to ${newName}`, isComplete);
      }
      case "delete":
        return tense(`Deleting ${name}`, `Deleted ${name}`, isComplete);
      default:
        return tense(`Managing ${name}`, `Managed ${name}`, isComplete);
    }
  }

  return toolName.replace(/_/g, " ");
}

export function ToolInvocation({ toolName, state, args }: ToolInvocationProps) {
  const message = getToolMessage(toolName, state, args);
  const isComplete = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
