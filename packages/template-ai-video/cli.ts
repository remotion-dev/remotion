#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import prompts from "prompts";
import ora from "ora";
import chalk from "chalk";
import * as dotenv from "dotenv";
import {
  generateAiImage,
  generateVoice,
  getGenerateImageDescriptionPrompt,
  getGenerateStoryPrompt,
  openaiStructuredCompletion,
  setApiKey,
} from "./src/service";
import { AiVideoSlide, StoryScript, StoryWithImages } from "./src/types";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

interface GenerateOptions {
  apiKey?: string;
  elevenlabsApiKey?: string;
  title?: string;
  topic?: string;
}

class ContentFS {
  title: string;
  slug: string;

  constructor(title: string) {
    this.title = title;
    this.slug = this.getSlug();
  }

  saveSlides(slides: AiVideoSlide[]) {
    const dirPath = this.getDir();
    const filePath = path.join(dirPath, "slides.json");
    fs.writeFileSync(filePath, JSON.stringify(slides, null, 2));
  }

  getDir(dir?: string): string {
    const segments = ["public", "content", this.slug];
    if (dir) {
      segments.push(dir);
    }
    const p = path.join(process.cwd(), ...segments);
    fs.mkdirSync(p, { recursive: true });
    return p;
  }

  getImagePath(uid: string): string {
    const dirPath = this.getDir("images");
    return path.join(dirPath, `${uid}.png`);
  }

  getAudioPath(uid: string): string {
    const dirPath = this.getDir("audio");
    return path.join(dirPath, `${uid}.mp3`);
  }

  getSlug(): string {
    return this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }
}

async function generateStory(options: GenerateOptions) {
  try {
    let apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    let elevenlabsApiKey =
      options.elevenlabsApiKey || process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      const response = await prompts({
        type: "password",
        name: "apiKey",
        message: "Enter your OpenAI API key:",
        validate: (value) => value.length > 0 || "API key is required",
      });

      if (!response.apiKey) {
        console.log(chalk.red("API key is required. Exiting..."));
        process.exit(1);
      }

      apiKey = response.apiKey;
    }

    if (!elevenlabsApiKey) {
      const response = await prompts({
        type: "password",
        name: "elevenlabsApiKey",
        message: "Enter your ElevenLabs API key:",
        validate: (value) =>
          value.length > 0 || "ElevenLabs API key is required",
      });

      if (!response.elevenlabsApiKey) {
        console.log(chalk.red("API key is required. Exiting..."));
        process.exit(1);
      }

      elevenlabsApiKey = response.elevenlabsApiKey;
    }

    let { title, topic } = options;

    if (!title || !topic) {
      const response = await prompts([
        {
          type: "text",
          name: "title",
          message: "Enter the title of the story:",
          initial: title,
          validate: (value) => value.length > 0 || "Title is required",
        },
        {
          type: "text",
          name: "topic",
          message: "Enter the topic of the story:",
          initial: topic,
          validate: (value) => value.length > 0 || "Topic is required",
        },
      ]);

      if (!response.title || !response.topic) {
        console.log(chalk.red("Title and topic are required. Exiting..."));
        process.exit(1);
      }

      title = response.title;
      topic = response.topic;
    }

    console.log(chalk.blue(`\n📖 Creating story: "${title}"`));
    console.log(chalk.blue(`📝 Topic: ${topic}\n`));

    const storySpinner = ora("Generating story...").start();
    setApiKey(apiKey!);
    const storyRes = await openaiStructuredCompletion(
      getGenerateStoryPrompt(title!, topic!),
      StoryScript,
    );
    storySpinner.succeed(chalk.green("Story generated!"));

    const descriptionsSpinner = ora("Generating image descriptions...").start();
    const storyWithImagesRes = await openaiStructuredCompletion(
      getGenerateImageDescriptionPrompt(storyRes.text),
      StoryWithImages,
    );
    descriptionsSpinner.succeed(chalk.green("Image descriptions generated!"));

    const storySlides: AiVideoSlide[] = [];
    for (const item of storyWithImagesRes.result) {
      storySlides.push({
        uid: uuidv4(),
        text: item.text,
        imageDesc: item.imageDescription,
      });
    }

    console.log(storySlides);

    const contentFs = new ContentFS(title!);
    contentFs.saveSlides(storySlides);

    const imagesSpinner = ora("Generating images and voice...").start();
    for (const slide of storySlides) {
      await generateAiImage(slide.imageDesc, contentFs.getImagePath(slide.uid));
      await generateVoice(
        slide.text,
        elevenlabsApiKey!,
        contentFs.getAudioPath(slide.uid),
      );
      break;
    }
    imagesSpinner.succeed(chalk.green("Images generated!"));

    const finalSpinner = ora("Generating final result...").start();
    finalSpinner.succeed(chalk.green("Final result generated!"));

    console.log(chalk.green.bold("\n✨ Story generation complete!\n"));

    return {};
  } catch (error) {
    console.error(chalk.red("\n❌ Error:"), error);
    process.exit(1);
  }
}

yargs(hideBin(process.argv))
  .command(
    "generate",
    "Generate story timeline for given title and topic",
    (yargs) => {
      return yargs
        .option("api-key", {
          alias: "k",
          type: "string",
          description: "OpenAI API key",
        })
        .option("title", {
          alias: "t",
          type: "string",
          description: "Title of the story",
        })
        .option("topic", {
          alias: "p",
          type: "string",
          description:
            "Topic of the story (e.g. Interesting Facts, History, etc.)",
        });
    },
    async (argv) => {
      await generateStory({
        apiKey: argv["api-key"],
        title: argv.title,
        topic: argv.topic,
      });
    },
  )
  .command(
    "$0",
    "Generate a story (default command)",
    (yargs) => {
      return yargs
        .option("api-key", {
          alias: "k",
          type: "string",
          description: "OpenAI API key",
        })
        .option("title", {
          alias: "t",
          type: "string",
          description: "Title of the story",
        })
        .option("topic", {
          alias: "p",
          type: "string",
          description:
            "Topic of the story (e.g. Interesting Facts, History, etc.)",
        });
    },
    async (argv) => {
      await generateStory({
        apiKey: argv["api-key"],
        title: argv.title,
        topic: argv.topic,
      });
    },
  )
  .demandCommand(0, 1)
  .help()
  .alias("help", "h")
  .version()
  .alias("version", "v")
  .strict()
  .parse();
