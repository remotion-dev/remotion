import { ProcessStatus } from "../components/ProcessingStatus";
import { convertInBrowser } from "./convert-in-browser";
import { getExtension } from "./find-good-supported-codec";

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

  const saved = await convertInBrowser({
    src: data,
    mimeType,
    onProgress: (progress, abortFn) => {
      setStatus({
        title: `Converting ${prefix}${endDate}.${getExtension(mimeType)}`,
        description: `${Math.round(progress * 100)}% progress`,
        abort: abortFn,
      });
    },
  });

  if (!saved) {
    throw new Error("Conversion failed");
  }

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
