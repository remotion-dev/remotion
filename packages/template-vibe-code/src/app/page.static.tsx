import { Editor } from "@/editor/Editor";
import { PROJECT_ENTRY_POINT } from "@/lib/project-paths";
import { readProjectFiles } from "@/server/project-files";

// The page of the static export (see next.config.mjs): the project is read
// once at build time and edits stay in memory.
export default async function Page() {
  const files = await readProjectFiles();

  return (
    <Editor
      initialFiles={files}
      entryPoint={PROJECT_ENTRY_POINT}
      canSave={false}
    />
  );
}
