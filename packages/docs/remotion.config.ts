import path from "path";
import { Config } from "remotion";

Config.Bundling.setPublicDir(path.join(process.cwd(), "static"));
