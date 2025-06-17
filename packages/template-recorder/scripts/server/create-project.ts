import { existsSync, mkdirSync } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import path from "path";

export const createProject = async (
  req: IncomingMessage,
  res: ServerResponse,
  rootDir: string,
) => {
  let data = "";

  const { projectName } = await new Promise<{ projectName: string }>(
    (resolve) => {
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        resolve(JSON.parse(data));
      });
    },
  );

  if (projectName === "") {
    res.statusCode = 500;
    res.write(
      JSON.stringify({
        success: false,
        message: "Empty string is an invalid project name",
      }),
    );
    return res.end();
  }

  const finalPath = path.join(rootDir, "public", projectName);

  if (existsSync(finalPath)) {
    res.statusCode = 409;
    res.write(
      JSON.stringify({
        success: false,
        message: `Name conflict: A project named "${projectName}" already exists. Choose another name.`,
      }),
    );
    return res.end();
  }

  try {
    mkdirSync(finalPath);
    res.statusCode = 201;
    res.write(
      JSON.stringify({
        success: true,
        message: `Project "${projectName}" created successfully.`,
      }),
    );
    return res.end();
  } catch (e) {
    res.statusCode = 500;
    res.write(
      JSON.stringify({
        success: false,
        message: `Something went wrong while creating the new folder.`,
      }),
    );
    return res.end();
  }
};
