---
name: transcribe-captions
description: Transcribing audio to generate captions in Remotion
metadata:
  tags: captions, transcribe, whisper, audio, speech-to-text
---

---

name: transcribe-captions
description: Transcribing audio to generate captions in Remotion with proper file handling
metadata:
tags: captions, transcribe, whisper, audio, speech-to-text, public-folder

---

# Transcribing audio for captions

## Video file placement

**IMPORTANT**: Always place video files in the `public/` folder of your Remotion project before transcribing:

```
your-remotion-project/
├── public/
│   └── video.mp4  👈 Your video file goes here
├── src/
└── package.json
```

## Recommended approach: @remotion/install-whisper-cpp

For server-side transcription with proper whitespace preservation:

```tsx
import path from 'path';
import {execSync} from 'child_process';
import {staticFile} from 'remotion';
import {transcribe, convertToCaptions, installWhisperCpp, downloadWhisperModel} from '@remotion/install-whisper-cpp';

// Setup (run once)
const whisperFolder = path.join(process.cwd(), 'whisper.cpp');
await installWhisperCpp({to: whisperFolder, version: '1.5.5'});
await downloadWhisperModel({model: 'medium.en', folder: whisperFolder});

// Transcribe video from public folder
const videoInPublic = staticFile('video.mp4'); // References public/video.mp4
const tempAudioPath = path.join(process.cwd(), 'temp-audio.wav');

// Convert to required format (16kHz WAV)
execSync(`ffmpeg -i "${videoInPublic}" -ar 16000 -ac 1 "${tempAudioPath}" -y`);

// Transcribe with whitespace preservation
const {transcription} = await transcribe({
  model: 'medium.en',
  whisperPath: whisperFolder,
  whisperCppVersion: '1.5.5',
  inputPath: tempAudioPath,
  tokenLevelTimestamps: true,
  splitOnWord: false, // Preserves natural pauses
});

// Convert to captions with timing preservation
const {captions} = convertToCaptions({
  transcription,
  combineTokensWithinMilliseconds: 200, // Adjust for natural speech flow
});

// Save captions back to public folder
import {writeFileSync} from 'fs';
writeFileSync(path.join(process.cwd(), 'public', 'captions.json'), JSON.stringify(captions, null, 2));

// Clean up
execSync(`rm "${tempAudioPath}"`);
```

## Alternative options

- `@remotion/whisper-web` - Browser transcription (slower, but no server needed)
  https://remotion.dev/docs/whisper-web

- `@remotion/openai-whisper` - Cloud transcription (fast, but paid)  
  https://remotion.dev/docs/openai-whisper/openai-whisper-api-to-captions

## Using transcribed captions

```tsx
import {staticFile, Sequence, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import captionsData from '../public/captions.json';

export const VideoWithCaptions: React.FC = () => {
  const {fps} = useVideoConfig();
  const captions: Caption[] = captionsData;

  return (
    <div>
      <Video src={staticFile('video.mp4')} />
      {captions.map((caption, index) => (
        <Sequence key={index} from={caption.startInSeconds * fps} durationInFrames={caption.durationInSeconds * fps}>
          <div
            style={{
              position: 'absolute',
              bottom: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '24px',
            }}
          >
            {caption.text}
          </div>
        </Sequence>
      ))}
    </div>
  );
};
```

## Common issues and solutions

**Problem**: Video not found during transcription  
**Solution**: Ensure video is in `public/` folder and use `staticFile('filename.mp4')`

**Problem**: Captions lose timing/whitespace  
**Solution**: Set `splitOnWord: false` and adjust `combineTokensWithinMilliseconds`

**Problem**: Audio format errors  
**Solution**: Always convert to 16kHz WAV before transcribing with FFmpeg
