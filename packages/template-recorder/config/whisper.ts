import type { Language, WhisperModel } from "@remotion/install-whisper-cpp";
import path from "path";

export const WHISPER_PATH = path.join(process.cwd(), "whisper.cpp");
export const WHISPER_MODEL: WhisperModel = "medium.en";
// The git reference, can be a commit, branch or tag
// The git reference, can be a commit, branch or tag
// On Windows, using the latest version which has a binary
// on all other platforms we compile
export const WHISPER_REF = process.platform === "win32" ? "1.6.0" : "1.7.2";
export const TRANSCRIPTION_LANGUAGE: Language | null = null;
