import crypto from "crypto";

export const getImageHash = (obj: unknown): string => {
  return crypto.createHash("md5").update(JSON.stringify(obj)).digest("hex");
};
