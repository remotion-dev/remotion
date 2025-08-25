---
image: /generated/articles-docs-recorder-experiments.png
title: Experiments
crumb: Recorder
---

This page aims to collect experiments and hacks that were made to the Remotion Recorder

## Swear word detection

[Here](https://www.youtube.com/watch?v=UurGWCLRuEI) is a demonstration by [Matt McGillivray](https://www.remotion.dev/experts/matthew-mcgillivray) of how swear words can be automatically censored and replaced with a sound effect.

## AI audio enhancement

Another experiment by [Matt McGillivray](https://www.remotion.dev/experts/matthew-mcgillivray) is [this one](https://www.linkedin.com/posts/matthew-mcgillivray-68295a55_aicoustics-takes-my-very-modest-recording-activity-7363434985233543171-2XQ_) where he uses the ai|coustics API to enhance the audio of his recording.

```ts title="enhance-audio.ts"
import {$} from 'bun';
import {WEBCAM_PREFIX} from './config/cameras';

const API_URL = 'https://api.ai-coustics.com/v1';
const API_KEY = process.env.AI_COUSTICS_API_KEY;

if (!API_KEY) {
  console.error('AI_COUSTICS_API_KEY environment variable is required');
  process.exit(1);
}

async function uploadAndEnhance(
  audioBuffer: ArrayBuffer,
  fileName: string,
  options: {
    loudness_target_level?: number;
    loudness_peak_limit?: number;
    enhancement_level?: number;
    transcode_kind?: string;
  } = {},
) {
  const {loudness_target_level = -14, loudness_peak_limit = -1, enhancement_level = 0.7, transcode_kind = 'MP3'} = options;

  const formData = new FormData();
  formData.append('loudness_target_level', loudness_target_level.toString());
  formData.append('loudness_peak_limit', loudness_peak_limit.toString());
  formData.append('enhancement_level', enhancement_level.toString());
  formData.append('transcode_kind', transcode_kind);
  formData.append('model_arch', 'FINCH');

  const audioBlob = new Blob([audioBuffer], {
    type: 'application/octet-stream',
  });
  formData.append('file', audioBlob, fileName);

  if (!API_KEY) {
    throw new Error('API_KEY is undefined');
  }

  try {
    const response = await fetch(`${API_URL}/media/enhance`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
      },
      body: formData,
    });

    if (response.status !== 201) {
      const responseText = await response.text();
      throw new Error(`API error: ${responseText}`);
    }

    const responseJson = await response.json();
    const generatedName = responseJson.generated_name;
    console.log(`Uploaded file's generated name: ${generatedName}`);
    return generatedName;
  } catch (error) {
    throw new Error(`Failed to enhance audio: ${error}`);
  }
}

async function downloadEnhancedMedia(generatedName: string, outputFilePath: string, maxRetries = 60, retryDelayMs = 5000) {
  const url = `${API_URL}/media/${generatedName}`;

  if (!API_KEY) {
    throw new Error('API_KEY is undefined');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'X-API-Key': API_KEY,
        },
      });

      if (response.status === 200) {
        const arrayBuffer = await response.arrayBuffer();
        await Bun.write(outputFilePath, new Uint8Array(arrayBuffer));
        console.log(`✓ Downloaded enhanced audio to: ${outputFilePath}`);
        return;
      } else if (response.status === 202) {
        console.log(`⏳ Audio still processing... (attempt ${attempt}/${maxRetries})`);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
          continue;
        }
      } else {
        const responseText = await response.text();
        throw new Error(`API error: ${responseText}`);
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Failed to download after ${maxRetries} attempts: ${error}`);
      }
      console.log(`⚠️ Download attempt ${attempt} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  throw new Error(`Audio still processing after ${(maxRetries * retryDelayMs) / 1000} seconds`);
}

async function extractAudioForAPI(
  videoPath: string,
  options: {
    outputFormat?: 'mp3';
    bitrate?: number;
    sampleRate?: number;
  } = {},
) {
  const {outputFormat = 'mp3', bitrate = 128, sampleRate = 44100} = options;

  const fileName =
    videoPath
      .split('/')
      .pop()
      ?.replace(/\.[^/.]+$/, '') || 'audio';
  const outputDir = videoPath.replace(/\/[^/]+$/, '/audio');
  const outputPath = `${outputDir}/${fileName}.${outputFormat}`;

  await $`mkdir -p ${outputDir}`.quiet();

  try {
    await $`ffmpeg -hide_banner -i ${videoPath} -vn -acodec libmp3lame -ab ${bitrate}k -ar ${sampleRate} ${outputPath} -y`.quiet();

    const audioBuffer = await Bun.file(outputPath).arrayBuffer();
    return {audioBuffer, outputPath, fileName: `${fileName}.${outputFormat}`};
  } catch (error) {
    throw new Error(`Failed to extract audio from ${videoPath}: ${error}`);
  }
}

async function replaceAudioInVideo(originalVideoPath: string, enhancedAudioPath: string, outputVideoPath: string) {
  try {
    await $`ffmpeg -hide_banner -i ${originalVideoPath} -i ${enhancedAudioPath} -c:v copy -c:a libopus -map 0:v:0 -map 1:a:0 ${outputVideoPath} -y`;
    console.log(`✓ Replaced audio in video: ${outputVideoPath}`);
  } catch (error) {
    console.error('FFmpeg stderr:', error.stderr?.toString());
    console.error('FFmpeg stdout:', error.stdout?.toString());
    throw new Error(`Failed to replace audio in video: ${error}`);
  }
}

const id = process.argv[2];

if (!id) {
  console.error('Please provide a composition ID');
  console.error('Usage: bun enhanceAudio.ts <composition-id>');
  process.exit(1);
}

const files = await $`ls public/${id}`.quiet();
const webcamFiles = files.stdout
  .toString('utf8')
  .split('\n')
  .filter((f) => f.startsWith(WEBCAM_PREFIX));

if (webcamFiles.length === 0) {
  console.log(`No webcam files found in public/${id}`);
  process.exit(0);
}

console.log(`Found ${webcamFiles.length} webcam files to process`);

const rawDir = `public/${id}/raw`;
await $`mkdir -p ${rawDir}`.quiet();

for (const file of webcamFiles) {
  const videoPath = `public/${id}/${file}`;
  const rawVideoPath = `${rawDir}/${file}`;
  console.log(`Processing ${file}...`);

  try {
    await $`cp ${videoPath} ${rawVideoPath}`.quiet();
    console.log(`✓ Backed up original to raw/`);

    const {audioBuffer, outputPath, fileName} = await extractAudioForAPI(videoPath);
    console.log(`✓ Extracted audio: ${outputPath} (${audioBuffer.byteLength} bytes)`);

    console.log(`Enhancing audio with AI-coustics...`);
    const generatedName = await uploadAndEnhance(audioBuffer, fileName);
    console.log(`✓ Enhanced audio uploaded: ${generatedName}`);

    const enhancedOutputPath = outputPath.replace('.mp3', '_enhanced.mp3');
    await downloadEnhancedMedia(generatedName, enhancedOutputPath);

    await replaceAudioInVideo(rawVideoPath, enhancedOutputPath, videoPath);

    await $`rm ${outputPath}`.quiet();
    await $`rm ${enhancedOutputPath}`.quiet();
    console.log(`✓ Cleaned up temporary audio files`);
  } catch (error) {
    console.error(`✗ Failed to process ${file}:`, error);
  }
}
```

## Code Hike integration

In a [branch](https://github.com/remotion-dev/recorder/pull/123), we experimented with using Code snippets instead of videos as a source for the display.
