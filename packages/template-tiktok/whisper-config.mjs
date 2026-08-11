import path from "node:path";

// Where to install Whisper.cpp to
export const WHISPER_PATH = path.join(process.cwd(), "whisper.cpp");

// The version of Whisper.cpp to install
export const WHISPER_VERSION = "1.6.0";

// Which model to use.
// | Model            | Disk   | Mem      |
// |------------------|--------|----------|
// | tiny             | 75 MB  | ~390 MB  |
// | tiny.en          | 75 MB  | ~390 MB  |
// | base             | 142 MB | ~500 MB  |
// | base.en          | 142 MB | ~500 MB  |
// | small            | 466 MB | ~1.0 GB  |
// | small.en         | 466 MB | ~1.0 GB  |
// | medium           | 1.5 GB | ~2.6 GB  |
// | medium.en        | 1.5 GB | ~2.6 GB  |
// | large-v1         | 2.9 GB | ~4.7 GB  |
// | large-v2         | 2.9 GB | ~4.7 GB  |
// | large-v3         | 2.9 GB | ~4.7 GB  |
// | large-v3-turbo   | 1.5 GB | ~4.7 GB  | // Only supported from Whisper.cpp 1.7.2 and higher
// | large            | 2.9 GB | ~4.7 GB  |

/**
 * @type {import('@remotion/install-whisper-cpp').WhisperModel}
 */
export const WHISPER_MODEL = "medium.en";

// Language to transcribe
// If you set another language than 'en', remove .en from the WHISPER_MODEL
// List of languages: https://github.com/openai/whisper/blob/main/whisper/tokenizer.py
/**
 * @type {import('@remotion/install-whisper-cpp').Language}
 */
export const WHISPER_LANG = "en";
