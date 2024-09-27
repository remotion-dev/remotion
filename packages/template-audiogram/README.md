# Remotion Audiogram Template

This template is for creating "audiograms". In other words, video clips from podcast episodes, or any other audio. It's a popular way of sharing audio snippets on social media.

[Example video](https://twitter.com/marcusstenbeck/status/1460641903326732300)

<p align="center">
  <img src="https://github.com/marcusstenbeck/remotion-template-audiogram/raw/main/Promo.png">
</p>

Start changing things like this:

- Adjust size and length in `src/Video.tsx`
- Replacing audio, cover and subtitles in the `src/assets` folder
- Tweak `src/Composition.tsx`

## How do I render my video?

Run this:

```console
npm run build
```

Or check out the [Remotion docs](/docs/render/). There are lots of ways to render.

## Where to get a transcript (SRT file)?

There are a few places:

- Your podcasting host might provide them for you.
- Descript makes transcription really easy.
- There are tons of other, paid solutions, like [Otter.ai](https://otter.ai), [Scriptme.io](https://scriptme.io) and [ListenRobo.com](https://listenrobo.com).
- And open-source solutions available, like [Subs AI](https://github.com/abdeladim-s/subsai)

For the purposes of this repo, make sure to export subtitles that are segmented by word (rather than sentence).

## Commands

**Install Dependencies**

```console
npm install
```

**Start Preview**

```console
npm start
```

**Render video**

```console
npm run build
```

**Upgrade Remotion**

```console
npm run upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help [on our Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. Read [the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
