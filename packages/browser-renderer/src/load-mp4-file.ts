import { createFile, MP4ArrayBuffer, MP4File, MP4Info } from "mp4box";

type ReturnType = {
  mp4File: MP4File;
  info: MP4Info;
};

const readFile = (file: File): Promise<MP4ArrayBuffer> => {
  return new Promise<MP4ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      (reader.result as MP4ArrayBuffer).fileStart = 0;
      resolve(reader.result as MP4ArrayBuffer);
      reader.onerror = null;
      reader.onload = null;
    };
    reader.onerror = (error) => {
      reject(error);
      reader.onerror = null;
      reader.onload = null;
    };
    reader.readAsArrayBuffer(file);
  });
};

export const loadMp4File = async (file: File) => {
  const mp4File = createFile();

  const arrayBuffer = await readFile(file);

  const prom = new Promise<ReturnType>((resolve, reject) => {
    mp4File.onError = (error) => {
      reject(error);
    };

    mp4File.onReady = async (info) => {
      resolve({ mp4File, info });
    };
  });

  mp4File.appendBuffer(arrayBuffer);
  mp4File.flush();

  return prom;
};
