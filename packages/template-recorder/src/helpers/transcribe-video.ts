import { makeStreamer } from "@remotion/streaming";
import { TRANSCRIBE_VIDEO } from "../../scripts/server/constants";
import {
  MessageTypeId,
  StreamingMessage,
  formatMap,
  messageTypeIdToMessageType,
} from "../../scripts/server/streaming";
import { ProcessStatus } from "../components/ProcessingStatus";
import { cancelTranscribeOnServer } from "./cancel-transcribe";
import { parseJsonOrThrowSource } from "./upload-file";

export const transcribeVideoOnServer = async ({
  onProgress,
  endDate,
  selectedFolder,
}: {
  onProgress: (status: ProcessStatus) => void;
  endDate: number;
  selectedFolder: string;
}) => {
  const url = new URL(TRANSCRIBE_VIDEO, window.location.origin);

  url.search = new URLSearchParams({
    folder: selectedFolder,
    endDateAsString: endDate.toString(),
  }).toString();

  const streamer = makeStreamer((status, messageTypeId, data) => {
    const messageType = messageTypeIdToMessageType(
      messageTypeId as MessageTypeId,
    );
    const innerPayload =
      formatMap[messageType] === "json"
        ? parseJsonOrThrowSource(data, messageType)
        : data;

    const { message }: StreamingMessage = {
      successType: status,
      message: {
        type: messageType,
        payload: innerPayload,
      },
    };

    if (message.type === "transcribing-progress") {
      onProgress({
        title: `Transcribing ${message.payload.filename}`,
        description: `${message.payload.progress}%`,
        abort: () => cancelTranscribeOnServer(),
      });
    }
    if (message.type === "install-whisper-progress") {
      onProgress({
        title: `Installing Whisper`,
        description: `See console for progress`,
        abort: () => cancelTranscribeOnServer(),
      });
    }
    if (message.type === "downloading-whisper-model-progress") {
      onProgress({
        title: `Downloading Whisper model`,
        description: `${Math.round(message.payload.progressInPercent)}%`,
        abort: () => cancelTranscribeOnServer(),
      });
    }
    if (message.type === "whisper-abort") {
      throw new Error("aborted by user");
    }
  });

  const res = await fetch(url, {});
  if (!res.body) {
    throw new Error("No body");
  }

  const reader = res.body.getReader();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (value) {
      streamer.onData(value);
    }
    if (done) break;
  }
};
