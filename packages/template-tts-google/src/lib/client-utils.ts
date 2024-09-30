import { SERVER_URL } from "../server/TextToSpeech/constants";
import { RequestMetadata, ServerResponse } from "./interfaces";

export const getTTSFromServer = async (
  props: RequestMetadata,
): Promise<string> => {
  const result: ServerResponse = await (
    await fetch(SERVER_URL + `/getdata`, {
      method: "POST",
      body: JSON.stringify(props),
      headers: { "Content-Type": "application/json" },
    })
  ).json();
  if (result.type === "error") throw new Error(result.error);
  return result.url;
};
