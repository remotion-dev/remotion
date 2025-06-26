import { ProcessStatus } from "../components/ProcessingStatus";
import { convertInBrowser } from "./convert-in-browser";
import { getExtension } from "./find-good-supported-codec";
import { formatMilliseconds } from "./format-time";

export const downloadVideo = async ({
  data,
  endDate,
  prefix,
  setStatus,
  mimeType,
}: {
  data: Blob;
  endDate: number;
  prefix: string;
  mimeType: string;
  setStatus: React.Dispatch<React.SetStateAction<ProcessStatus | null>>;
}) => {
  const webcamchunks: Blob[] = [];
  if (data.size > 0) {
    webcamchunks.push(data);
  }

  const result = await convertInBrowser({
    src: data,
    mimeType,
    onProgress: ({ millisecondsWritten }, abortFn) => {
      setStatus({
        title: `Converting ${prefix}${endDate}.${getExtension(mimeType)}`,
        description: `${formatMilliseconds(millisecondsWritten)} processed`,
        abort: abortFn,
      });
    },
  });

  const saved = await result.save();

  const link = document.createElement("a");
  const blobUrl = URL.createObjectURL(saved);
  link.href = blobUrl;
  link.download = `${prefix}${endDate}.${getExtension(mimeType)}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(blobUrl);
  setStatus(null);
};
