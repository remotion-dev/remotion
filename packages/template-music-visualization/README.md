# Remotion Music Visualization Template

<div class='grid' markdown>
  <img alt='Spectrum Visualizer' width='300px' src='https://github.com/user-attachments/assets/74095cfd-5507-4875-9e55-2b7f66c72287' />
  <img alt='Waveform Visualizer' width='300px' src='https://github.com/user-attachments/assets/601b760c-952b-4fe4-90f4-527c9e2ad8b3' />
</div>

This template allows you to create stunning music visualization videos. Perfect for sharing song previews, album teasers, or music snippets on social media with beautiful visual effects synchronized to your audio.

## Commands

**Install Dependencies**

```console
npm install
```

**Start Preview**

```console
npx remotion studio
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Customization

You can customize your music visualization:

- Choose between spectrum or waveform visualizer
- Customize colors, wave patterns, and visual parameters
- Add your album artwork, song name, and artist name
- Adjust audio timing and visualization settings

All parameters can be modified in `src/Root.tsx` or directly in the Studio sidebar.

## How do I create my video?

1. Replace the audio file in the `public` folder with your music track
2. Update the cover artwork in the `public` folder
3. Adjust the song and artist information
4. Customize the visualizer settings to match your music style

Then render your video by running clicking "Render" button in Remotion Studio.

Check out the [Remotion docs](/docs/render/) for more rendering options.

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help [on our Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? Upgrade Remotion to receive fixes:

```
npx remotion upgrade
```

Didn't help? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## Contributing

The source of this template is in the [Remotion Monorepo](https://github.com/remotion-dev/remotion/tree/main/packages/template-music-visualization).  
Don't send pull requests here, this is only a mirror.

## License

Note that for some entities a company license is needed. Read [the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
