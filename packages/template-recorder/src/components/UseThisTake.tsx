import React, { useCallback } from "react";
import { WEBCAM_PREFIX } from "../../config/cameras";
import { RecordingStatus } from "../RecordButton";
import { cancelTranscribeOnServer } from "../helpers/cancel-transcribe";
import { convertInBrowser } from "../helpers/convert-in-browser";
import { downloadVideo } from "../helpers/download-video";
import { getExtension } from "../helpers/find-good-supported-codec";
import { formatMilliseconds } from "../helpers/format-time";
import { Prefix } from "../helpers/prefixes";
import { transcribeVideoOnServer } from "../helpers/transcribe-video";
import { uploadFileToServer } from "../helpers/upload-file";
import { ProcessStatus } from "./ProcessingStatus";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
let currentProcessing = Promise.resolve();

export const UseThisTake: React.FC<{
  readonly selectedFolder: string | null;
  recordingStatus: RecordingStatus;
  setRecordingStatus: React.Dispatch<React.SetStateAction<RecordingStatus>>;
  setStatus: React.Dispatch<React.SetStateAction<ProcessStatus | null>>;
}> = ({ selectedFolder, recordingStatus, setRecordingStatus, setStatus }) => {
  const keepVideoOnServer = useCallback(async () => {
    if (recordingStatus.type !== "recording-finished") {
      throw new Error("Recording not finished");
    }

    if (selectedFolder === null) {
      // eslint-disable-next-line no-alert
      alert("Please select a folder first.");
      return Promise.resolve();
    }

    let aborted = false;

    for (const blob of recordingStatus.blobs) {
      const extension = getExtension(blob.mimeType);
      currentProcessing = currentProcessing
        .then(() => {
          setStatus({
            title: `Converting ${blob.prefix}${blob.endDate}.${extension}`,
            description: "Starting...",
            abort: null,
          });
          return blob.data();
        })
        .then((src) => {
          return convertInBrowser({
            src: src,
            mimeType: blob.mimeType,
            onProgress: ({ millisecondsWritten }, abortFn) => {
              setStatus({
                title: `Converting ${blob.prefix}${blob.endDate}.${extension}`,
                description: `${formatMilliseconds(millisecondsWritten)} processed`,
                abort: abortFn,
              });
            },
          });
        })
        .then((d) => d.save())
        .then((convertedBlob) => {
          setStatus({
            title: `Copying to public folder ${blob.prefix}${blob.endDate}.${extension}`,
            description: "Copying in progress",
            abort: null,
          });
          return uploadFileToServer({
            blob: convertedBlob,
            endDate: recordingStatus.endDate,
            prefix: blob.prefix,
            selectedFolder,
            expectedFrames: recordingStatus.expectedFrames,
            mimeType: blob.mimeType,
          });
        })
        .then(() => {
          setStatus(null);
        })
        .catch((err) => {
          // ⚠️ might come from @remotion/webcodecs or from transcribe-video.ts
          if ((err as Error).message.includes("aborted by user")) {
            aborted = true;
            return;
          }
          alert(
            "Failed to convert video. Downloaded original video for backup.",
          );
          console.log(err);
          return blob.data();
        })
        .then((buffer) => {
          if (buffer) {
            const blobToDownload = new Blob([buffer], {
              type: blob.mimeType.includes("webm") ? "video/webm" : "video/mp4",
            });
            const a = document.createElement("a");
            const url = URL.createObjectURL(blobToDownload);
            a.href = url;
            a.download = `${blob.prefix}${blob.endDate}.${extension}`;
            a.click();
            blob.releaseData();
          }
        });
    }
    if (aborted) {
      return;
    }

    currentProcessing = currentProcessing
      .then(() => {
        setStatus({
          title: `Transcribing ${WEBCAM_PREFIX}${recordingStatus.endDate}.${recordingStatus.blobs.find((b) => b.prefix === WEBCAM_PREFIX)?.mimeType.includes("webm") ? "webm" : "mp4"}`,
          description: "See Terminal for progress",
          abort: () => cancelTranscribeOnServer(),
        });
        return transcribeVideoOnServer({
          endDate: recordingStatus.endDate,
          selectedFolder,
          onProgress: (stat) => {
            setStatus(stat);
          },
        });
      })
      .catch((err) => {
        // ⚠️ might come from @remotion/webcodecs or from transcribe-video.ts
        if ((err as Error).message.includes("aborted by user")) {
          return;
        }

        console.log(err);
      })
      .then(() => {
        setStatus(null);
      });

    setRecordingStatus({ type: "idle" });
  }, [recordingStatus, selectedFolder, setRecordingStatus, setStatus]);

  const keepVideosWithoutConverting = useCallback(async () => {
    if (recordingStatus.type !== "recording-finished") {
      throw new Error("Recording not finished");
    }

    for (const blob of recordingStatus.blobs) {
      const buffer = await blob.data();
      const extension = getExtension(blob.mimeType);

      const blobToDownload = new Blob([buffer], {
        type: blob.mimeType.includes("webm") ? "video/webm" : "video/mp4",
      });
      const a = document.createElement("a");
      const url = URL.createObjectURL(blobToDownload);
      a.href = url;
      a.download = `${blob.prefix}${blob.endDate}-unprocessed.${extension}`;
      a.click();
    }
  }, [recordingStatus]);

  const keepVideoOnClient = useCallback(async () => {
    if (recordingStatus.type !== "recording-finished") {
      throw new Error("Recording not finished");
    }

    for (const blob of recordingStatus.blobs) {
      await downloadVideo({
        data: await blob.data(),
        endDate: recordingStatus.endDate,
        prefix: blob.prefix,
        mimeType: blob.mimeType,
        setStatus,
      });
    }
  }, [recordingStatus, setStatus]);

  const previewWebcam = useCallback(
    async (prefix: Prefix) => {
      if (recordingStatus.type !== "recording-finished") {
        throw new Error("Recording not finished");
      }

      const webcamBlob = recordingStatus.blobs.find((b) => b.prefix === prefix);
      if (!webcamBlob) {
        throw new Error("No webcam blob");
      }

      // turn into blob url and open in new tab
      const blob = new Blob([await webcamBlob.data()], {
        type: webcamBlob.mimeType,
      });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    },
    [recordingStatus],
  );

  return (
    <>
      <div className="flex items-center">
        {window.remotionServerEnabled ? (
          <Button
            variant="default"
            className={"rounded-r-none"}
            onClick={keepVideoOnServer}
          >
            {`Copy to public/${selectedFolder}`}
          </Button>
        ) : (
          <Button
            variant="default"
            className={"rounded-r-none"}
            onClick={keepVideoOnClient}
          >
            {`Download files`}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              className={"rounded-l-none border-l-2 px-2"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                style={{ width: 12 }}
              >
                <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {window.remotionServerEnabled ? (
              <DropdownMenuItem onClick={keepVideoOnClient}>
                Download as file
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={keepVideosWithoutConverting}>
              Download without conversion
            </DropdownMenuItem>
            {recordingStatus.type === "recording-finished" &&
              recordingStatus.blobs.map((blob) => (
                <DropdownMenuItem
                  key={blob.prefix}
                  onClick={() => {
                    previewWebcam(blob.prefix as Prefix);
                  }}
                >
                  Preview {blob.prefix}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
