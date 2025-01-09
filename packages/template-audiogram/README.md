# Remotion Audiogram Template

This template is for creating "audiograms". In other words, video clips from podcast episodes, or any other audio. It's a popular way of sharing audio snippets on social media.

[Example video](https://twitter.com/marcusstenbeck/status/1460641903326732300)

<p align="center">
  <img src="https://github.com/marcusstenbeck/remotion-template-audiogram/raw/main/Promo.png">
</p>

Start changing things like this:

- Adjust size and length in `src/Root.tsx`
- Replacing audio, cover and subtitles in the `public` folder
- Tweak `src/Audioframe.tsx`

## How do I render my video?

Run this:

```console
npx remotion render
```

Or check out the [Remotion docs](/docs/render/). There are lots of ways to render.

## Where to get a transcript?

You can supply a .srt file or a .json file that follows the [`@remotion/captions`](https://remotion.dev/docs/captions/caption) format. Examples for both are included.

**Generate them:**

- Use [`@remotion/install-whisper-cpp`](https://www.remotion.dev/docs/install-whisper-cpp/) to use Whisper locally
- Use [`@remotion/openai-whisper`](https://www.remotion.dev/docs/openai-whisper/openai-whisper-api-to-captions) to get captions from OpenAI Whisper into the right shape.

**Get it from a provider:**

- Your podcasting host might provide them for you.
- Descript makes transcription really easy.
- There are tons of other, paid solutions, like [Otter.ai](https://otter.ai), [Scriptme.io](https://scriptme.io) and [ListenRobo.com](https://listenrobo.com).

If you supply a .srt, make sure to export subtitles that are segmented by word rather than by sentence.

## Optimizing for long audio files

If your audio is long, pass a `.wav` file instead of another format. The template will use [`useWindowedAudioData()`](/docs/use-windowed-audio-data) to only fetch the data around the current time.  
Otherwise, the audio visualization may become a heavy duty for the browser or during rendering.

## Commands

**Install Dependencies**

```console
npm install
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help [on our Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. Read [the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
