---
image: /generated/articles-docs-install-whisper-cpp-index.png
title: '@remotion/install-whisper-cpp'
crumb: 'Transcribe audio locally'
---

# @remotion/install-whisper-cpp<AvailableFrom v="4.0.115" />

With [Whisper.cpp](https://github.com/ggerganov/whisper.cpp), you can transcribe audio locally on your machine.  
This package provides easy to use cross-platform functions to install Whisper.cpp and a model.

import {TableOfContents} from './install-whisper-cpp';

<Installation pkg="@remotion/install-whisper-cpp" />

## Example usage

Install Whisper `1.5.5` (the latest version at the time of writing that we find works well and supports token-level timestamps) and the `medium.en` model to the `whisper.cpp` folder.

```tsx twoslash title="install-whisper.cpp"
import path from 'path';
import {downloadWhisperModel, installWhisperCpp, transcribe, toCaptions} from '@remotion/install-whisper-cpp';
import fs from 'fs';

const to = path.join(process.cwd(), 'whisper.cpp');

await installWhisperCpp({
  to,
  version: '1.5.5',
});

await downloadWhisperModel({
  model: 'medium.en',
  folder: to,
});

// Convert the audio to a 16KHz wav file first if needed:
// import {execSync} from 'child_process';
// execSync('ffmpeg -i /path/to/audio.mp4 -ar 16000 /path/to/audio.wav -y');

const whisperCppOutput = await transcribe({
  model: 'medium.en',
  whisperPath: to,
  whisperCppVersion: '1.5.5',
  inputPath: '/path/to/audio.wav',
  tokenLevelTimestamps: true,
});

// Optional: Apply our recommended postprocessing
const {captions} = toCaptions({
  whisperCppOutput,
});

fs.writeFileSync('captions.json', JSON.stringify(captions, null, 2));
```

## Functions

<TableOfContents />

## License

MIT

## See also

- [`@remotion/openai-whisper`](/docs/openai-whisper)
