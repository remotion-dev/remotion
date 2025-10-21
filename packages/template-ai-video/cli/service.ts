import z from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { experimental_generateImage as generateImage } from "ai";
import * as fs from "fs";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { CharacterAlignmentResponseModel } from "@elevenlabs/elevenlabs-js/api";

let apiKey: string | null = null;

export const setApiKey = (key: string) => {
  apiKey = key;
};

const getOpenAiProvider = () => {
  if (!apiKey) {
    throw "Missing OpenAI API KEY";
  }

  return createOpenAI({
    apiKey,
  });
};

export const openaiStructuredCompletion = async <T>(
  prompt: string,
  schema: z.ZodType<T>,
): Promise<T> => {
  const openai = getOpenAiProvider();

  const { object } = await generateObject({
    model: openai("gpt-4.1"),
    schema,
    prompt,
  });

  return object as T;
};

function saveUint8ArrayToPng(uint8Array: Uint8Array, filePath: string) {
  const buffer = Buffer.from(uint8Array);
  fs.writeFileSync(filePath, buffer as Uint8Array);
}

export const generateAiImage = async (prompt: string, path: string) => {
  const openai = getOpenAiProvider();

  const { image } = await generateImage({
    model: openai.image("dall-e-3"),
    prompt,
    size: `1024x1792`,
  });

  saveUint8ArrayToPng(image.uint8Array, path);
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

export const generateVoice = async (
  text: string,
  apiKey: string,
  path: string,
): Promise<CharacterAlignmentResponseModel> => {
  const client = new ElevenLabsClient({
    environment: "https://api.elevenlabs.io",
    apiKey,
  });

  const voiceId = "21m00Tcm4TlvDq8ikWAM";

  const data = await client.textToSpeech.convertWithTimestamps(voiceId, {
    text,
  });

  saveBase64ToMp3(data.audioBase64, path);
  return data.alignment!;
};
