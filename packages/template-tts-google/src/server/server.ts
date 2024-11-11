import express from "express";
import { createTextToSpeechAudio } from "./TextToSpeech";
import cors from "cors";
import dotenv from "dotenv";
import { RequestMetadata, ServerResponse } from "../lib/interfaces";

dotenv.config();

export const startServer = () => {
  const app = express();
  const port = process.env.SERVER_PORT || 5050;

  app.use(express.json());
  app.use(cors({ origin: "*" }));

  app.post(`/getdata`, async (req, res) => {
    try {
      const data = req.body as RequestMetadata;

      const audioURL = await createTextToSpeechAudio({ ...data });

      return res
        .json({ type: "success", url: audioURL } as ServerResponse)
        .end();
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({
          type: "error",
          error: (err as Error).message,
        } as ServerResponse)
        .end();
    }
  });

  return app.listen(port, () => {
    console.log(`TTS server listening on ${port}`);
  });
};
