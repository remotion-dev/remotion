import { CANCEL_TRANSCRIBE } from "../../scripts/server/constants";

export const cancelTranscribeOnServer = async () => {
  const url = new URL(CANCEL_TRANSCRIBE, window.location.origin);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Not OK");
  }
};
