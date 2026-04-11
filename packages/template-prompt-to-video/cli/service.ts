import z from "zod";
import * as fs from "fs";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { CharacterAlignmentResponseModel } from "@elevenlabs/elevenlabs-js/api";
import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../src/lib/constants";
import type { WordTimestamp } from "../src/lib/types";

let apiKey: string | null = null;

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const openaiStructuredCompletion = async <T>(
  prompt: string,
  schema: z.ZodType<T>,
): Promise<T> => {
  const jsonSchema = z.toJSONSchema(schema);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "response",
          schema: {
            type: jsonSchema.type || "object",
            properties: jsonSchema.properties,
            required: jsonSchema.required,
            additionalProperties: jsonSchema.additionalProperties ?? false,
          },
          strict: true,
        },
      },
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`);

  const data = await res.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  const parsed = JSON.parse(content);
  return schema.parse(parsed);
};

function saveUint8ArrayToPng(uint8Array: Uint8Array, filePath: string) {
  const buffer = Buffer.from(uint8Array);
  fs.writeFileSync(filePath, buffer as Uint8Array);
}

export const generateAiImage = async ({
  prompt,
  path,
  onRetry,
}: {
  prompt: string;
  path: string;
  onRetry: (attempt: number) => void;
}) => {
  const maxRetries = 3;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxRetries) {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        size: `${IMAGE_WIDTH}x${IMAGE_HEIGHT}`,
        response_format: "b64_json",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const buffer = Buffer.from(data.data[0].b64_json, "base64");
      const uint8Array = new Uint8Array(buffer);

      saveUint8ArrayToPng(uint8Array, path);
      return;
    } else {
      lastError = new Error(
        `OpenAI error (attempt ${attempt + 1}): ${await res.text()}`,
      );
      attempt++;
      if (attempt < maxRetries) {
        // Wait 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      onRetry(attempt);
    }
  }

  // Ran out of retries, throw the last error
  throw lastError!;
};

export const getGenerateStoryPrompt = (title: string, topic: string) => {
  const prompt = `Write a short story with title [${title}] (its topic is [${topic}]).
   You must follow best practices for great storytelling. 
   The script must be 8-10 sentences long. 
   Story events can be from anywhere in the world, but text must be translated into English language. 
   Result result without any formatting and title, as one continuous text. 
   Skip new lines.`;

  return prompt;
};

export const getGenerateImageDescriptionPrompt = (storyText: string) => {
  const prompt = `You are given story text.
  Generate (in English) 5-8 very detailed image descriptions  for this story. 
  Return their description as json array with story sentences matched to images. 
  Story sentences must be in the same order as in the story and their content must be preserved.
  Each image must match 1-2 sentence from the story.
  Images must show story content in a way that is visually appealing and engaging, not just characters.
  Give output in json format:

  [
    {
      "text": "....",
      "imageDescription": "..."
    }
  ]

  <story>
  ${storyText}
  </story>`;

  return prompt;
};

const saveBase64ToMp3 = (data: string, path: string) => {
  const buffer = Buffer.from(data, "base64");
  fs.writeFileSync(path, buffer as Uint8Array);
};

const DEFAULT_ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export const generateVoice = async (
  text: string,
  apiKey: string,
  voiceId = DEFAULT_ELEVENLABS_VOICE_ID,
  path: string,
): Promise<CharacterAlignmentResponseModel> => {
  const client = new ElevenLabsClient({
    environment: "https://api.elevenlabs.io",
    apiKey,
  });

  const data = await client.textToSpeech.convertWithTimestamps(voiceId, {
    text,
  });

  if (!data.alignment || !data.alignment.characterEndTimesSeconds.length) {
    throw new Error("ElevenLabs response missing timestamps");
  }

  saveBase64ToMp3(data.audioBase64, path);
  return data.alignment;
};

const DEFAULT_TYPECAST_VOICE_ID = "tc_67512e5af2b6dbabce63f92a";

export const generateVoiceTypecast = async (
  text: string,
  typecastApiKey: string,
  voiceId = DEFAULT_TYPECAST_VOICE_ID,
  path: string,
): Promise<WordTimestamp[]> => {
  const { TypecastClient } = await import("@neosapience/typecast-js");
  const typecast = new TypecastClient({ apiKey: typecastApiKey });

  const audio = await typecast.textToSpeech({
    text,
    voice_id: voiceId,
    model: "ssfm-v30",
    output: { audio_format: "mp3" },
  });

  await fs.promises.writeFile(path, new Uint8Array(audio.audioData));

  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey: apiKey! });
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(path),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
  });

  const words = (transcription as unknown as { words?: WordTimestamp[] }).words;
  if (!words || words.length === 0) {
    throw new Error("Whisper did not return word-level timestamps");
  }

  return words;
};
