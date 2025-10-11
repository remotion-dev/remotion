import { SERVER_PORT } from "../../config/server";
import { CREATE_FOLDER } from "../../scripts/server/constants";

type CreateProjectResBodyType = {
  success: boolean;
  message: string;
};

export const createFolder = async (folderName: string) => {
  const payload = { projectName: folderName };
  const res = await fetch(`http://localhost:${SERVER_PORT}${CREATE_FOLDER}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const jsn = (await res.json()) as CreateProjectResBodyType;

  if (res.status === 201) {
    return jsn;
  }

  throw new Error(jsn.message);
};
