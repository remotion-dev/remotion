import { startServer } from "@jonny/motion-bundler";
import path from "path";

startServer(path.resolve(__dirname, "entry.tsx"));
