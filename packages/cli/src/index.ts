import xns from "xns";
import { bundle } from "@jonny/motion-renderer";

xns(async () => {
  const result = await bundle();
  return result;
});
