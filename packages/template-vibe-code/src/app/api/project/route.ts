import { NextResponse } from "next/server";
import { isAllowedProjectPath } from "@/lib/project-paths";
import { readProjectFiles, writeProjectFiles } from "@/server/project-files";

// Saving writes to src/remotion on disk, which only makes sense while
// developing locally. Deployed instances keep edits in memory.
const canWrite = process.env.NODE_ENV === "development";

export const GET = async () => {
  return NextResponse.json({ files: await readProjectFiles(), canWrite });
};

export const POST = async (request: Request) => {
  if (!canWrite) {
    return NextResponse.json(
      { error: "Saving to disk is only available in development." },
      { status: 403 },
    );
  }

  const body: unknown = await request.json();
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { files, deleted } = body as {
    files?: unknown;
    deleted?: unknown;
  };
  if (
    typeof files !== "object" ||
    files === null ||
    Object.entries(files).some(
      ([filePath, contents]) =>
        !isAllowedProjectPath(filePath) || typeof contents !== "string",
    )
  ) {
    return NextResponse.json({ error: "Invalid files" }, { status: 400 });
  }

  if (
    deleted !== undefined &&
    (!Array.isArray(deleted) ||
      deleted.some(
        (filePath) =>
          typeof filePath !== "string" || !isAllowedProjectPath(filePath),
      ))
  ) {
    return NextResponse.json({ error: "Invalid deletions" }, { status: 400 });
  }

  await writeProjectFiles({
    files: files as Record<string, string>,
    deleted: (deleted as string[] | undefined) ?? [],
  });
  return NextResponse.json({ ok: true });
};
