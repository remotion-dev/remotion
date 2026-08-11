import react from "@vitejs/plugin-react-swc";
import connect from "connect";
import { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { SERVER_PORT } from "../../config/server";
import {
  CANCEL_TRANSCRIBE,
  CREATE_FOLDER,
  GET_FOLDERS,
  TRANSCRIBE_VIDEO,
  UPLOAD_VIDEO,
} from "./constants";
import { createProject } from "./create-project";
import { indexHtmlDev } from "./index-html";
import { getProjectFolder } from "./projects";
import {
  handleCancelTranscription,
  handleTranscribeVideo,
  handleVideoUpload,
} from "./upload-video";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const startServer = async () => {
  const app = connect();

  const rootDir = path.join(__dirname, "..", "..");
  const publicDir = path.join(rootDir, "public");

  const vite = await createServer({
    configFile: false,
    root: rootDir,
    server: {
      middlewareMode: true,
      watch: {
        ignored: [path.join(rootDir, "whisper.cpp/**")],
      },
    },
    appType: "custom",
    plugins: [react()],
    publicDir,
  });

  app.use((req, res, next) => {
    vite.middlewares.handle(req, res, next);
  });

  app.use(GET_FOLDERS, (req: IncomingMessage, res: ServerResponse) => {
    getProjectFolder(req, res, rootDir);
  });

  app.use(CREATE_FOLDER, (req: IncomingMessage, res: ServerResponse) => {
    createProject(req, res, rootDir);
  });

  app.use(UPLOAD_VIDEO, handleVideoUpload);
  app.use(TRANSCRIBE_VIDEO, handleTranscribeVideo);
  app.use(CANCEL_TRANSCRIBE, handleCancelTranscription);
  app.use("/", indexHtmlDev(vite, rootDir));

  const port = process.env.PORT || SERVER_PORT;

  app.listen(port);
  console.log(`Recording interface running on http://localhost:${port}`);
};
