import path from "path";
import { Config } from "remotion";

Config.setPublicDir(path.join(process.cwd(), "static"));
