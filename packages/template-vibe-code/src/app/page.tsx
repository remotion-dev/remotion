import { Editor } from "@/editor/Editor";
import { PROJECT_ENTRY_POINT, readProjectFiles } from "@/server/project-files";

// Always read the project fresh from disk so edits made outside the browser
// show up after a reload.
export const dynamic = "force-dynamic";

export default async function Page() {
  const files = await readProjectFiles();

  return (
    <Editor
      initialFiles={files}
      entryPoint={PROJECT_ENTRY_POINT}
      canSave={process.env.NODE_ENV === "development"}
    />
  );
}
