# Remotion AI Video template

<p align="center">
  <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://cdn.webmonch.dev/img/remotion-template-promo.png">
      <img alt="Animated Remotion Logo" src="https://cdn.webmonch.dev/img/remotion-template-promo.png">
    </picture>
</p>

Using this template you can create high quality AI videos for TikTok or Instagram.

It includes a simple CLI that will generate story script, images and voiceover with OpenAI and ElevenLabs (other AI providers can be easily added).

## Getting started

**Install Dependencies**

```console
bun install
```

**Start Preview with demo video**

```console
bun dev
```

## Creating your own videos

You can easily create your own videos using provided CLI.

It will generate a script, images, voiceover and timeline based on your story title and topic. (topic can be e.g. history, eli5, fun facts, science, etc)

**Configure environment variables**
Create .env file with following env vars (you can also find them in .env.example):

```
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
```

If you do not create env file - you will be prompted for these variables when using CLI.

**Generate srory timeline**

```console
bun gen
```

You will be prompted API keys (if you haven't added them to .env file), story title and topic.

After that CLI will generate text, images and audio with timestamps, and combine all those into a timeline that van be used by this template to render a video.

## Docs

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
