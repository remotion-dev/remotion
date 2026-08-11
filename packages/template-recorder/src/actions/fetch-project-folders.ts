import { SERVER_PORT } from "../../config/server";
import { GET_FOLDERS } from "../../scripts/server/constants";
import type { FolderResBody } from "../../scripts/server/projects";

export const fetchProjectFolders = async () => {
  const res = await fetch(`http://localhost:${SERVER_PORT}${GET_FOLDERS}`, {
    method: "GET",
  });

  const projectFolders = (await res.json()) as FolderResBody;

  return projectFolders;
};
