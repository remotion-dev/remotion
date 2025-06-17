import { readdirSync } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import path from "path";

export type FolderResBody = {
  folders: string[];
};

export const getProjectFolder = (
  req: IncomingMessage,
  res: ServerResponse,
  rootDir: string,
) => {
  const publicDir = path.join(rootDir, "public");

  try {
    const files = readdirSync(publicDir, { withFileTypes: true });

    const folders = files.filter((file) => file.isDirectory());

    const folderNames = folders
      .map((folder) => folder.name)
      .filter((f) => f !== "sounds");

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ folders: folderNames }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: (e as Error).message }));
  }
};
