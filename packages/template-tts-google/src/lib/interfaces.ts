import { z } from "zod";
import { mySchema } from "../HelloWorld";
import { voices } from "../server/TextToSpeech/constants";

export type ServerResponse =
  | {
      type: "success";
      url: string;
    }
  | {
      type: "error";
      error: string;
    };
export type VoiceType = keyof typeof voices;
export type RequestMetadata = z.infer<typeof mySchema>;
