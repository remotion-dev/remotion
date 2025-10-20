import { VoiceDescriptor } from "./types";
import z from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";

export const voices: VoiceDescriptor[] = [
  { id: "alloy", name: "Alloy" },
  { id: "ash", name: "Ash" },
  { id: "ballad", name: "Ballad" },
  { id: "coral", name: "Coral" },
  { id: "echo", name: "Echo" },
  { id: "fable", name: "Fable" },
  { id: "nova", name: "Nova" },
  { id: "onyx", name: "Onyx" },
  { id: "sage", name: "Sage" },
  { id: "shimme", name: "Shimme" },
];

let apiKey: string | null = null;

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const openaiStructuredCompletion = async (
  prompt: string,
  schema: z.ZodType<unknown>,
) => {
  if (!apiKey) {
    throw "Missing OpenAI API KEY";
  }

  const openai = createOpenAI({
    apiKey,
  });

  const { object } = await generateObject({
    model: openai("gpt-4.1"),
    schema,
    prompt,
  });

  return object;
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
