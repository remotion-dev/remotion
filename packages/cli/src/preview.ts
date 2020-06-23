import { bundle } from "@jonny/motion-renderer";
import path from "path";
import xns from "xns";
import execa from "execa";

xns(async () => {
  const result = await bundle();
  await execa("open", [path.join(result, "index.html")]);
});
