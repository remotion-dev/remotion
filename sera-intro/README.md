# Sera Intro Video

An animated video intro for Sera - a neuroadaptive work management platform designed for sustainable productivity without burning out.

## Features

- **Logo Animation**: Smooth scale and fade-in effect for the Sera logo
- **Tagline Reveal**: Animated "Neuroadaptive Work Management" text
- **Description**: "Sustainable productivity without burning out" message
- **Website Display**: Shows serainclusion.com
- **Professional Timing**: 6-second intro with smooth transitions

## Getting Started

### Install Dependencies

```bash
npm install
```

### Preview the Video

```bash
npm start
```

This will open the Remotion Studio in your browser where you can preview and edit the video.

### Render the Video

```bash
npm run build
```

This will render the final video to `out/sera-intro.mp4`.

## Customization

### Update the Logo

To use your actual Sera logo image instead of the SVG version:

1. Place your logo image (PNG recommended) in the `public` folder
2. Update the `SeraLogo` component in `src/SeraIntro.tsx` to use:

```tsx
<img src={staticFile('sera-logo.png')} width={200} alt="Sera Logo" />
```

3. Import `staticFile` at the top:

```tsx
import { staticFile } from 'remotion';
```

### Adjust Timing

The video is currently 180 frames (6 seconds at 30fps). To change duration:

- Edit the `durationInFrames` in `src/Root.tsx`
- Adjust animation timings in `src/SeraIntro.tsx`

### Change Colors

- Background: Modify `backgroundColor` in the `AbsoluteFill` style
- Logo color: Update the SVG fill colors in the `SeraLogo` component
- Text colors: Change the `color` values in the text styles

### Video Settings

- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 fps
- **Duration**: 6 seconds

To modify these, edit `src/Root.tsx`.

## Project Structure

```
sera-intro/
├── src/
│   ├── SeraIntro.tsx    # Main video composition
│   ├── Root.tsx         # Composition registration
│   └── index.ts         # Entry point
├── public/              # Static assets (images, etc.)
├── out/                 # Rendered videos (created after build)
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

## Learn More

- [Remotion Documentation](https://www.remotion.dev/docs)
- [Sera Website](https://serainclusion.com)
