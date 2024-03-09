import { createFile, MP4ArrayBuffer, MP4File, MP4Info } from "mp4box";

type ReturnType = {
  mp4boxInputFile: MP4File;
  info: MP4Info;
};

export const loadMp4File = (file: File) => {
  const mp4boxInputFile = createFile();

  var reader = new FileReader();
  // caution: this binding!
  reader.onload = function () {
    (this.result as MP4ArrayBuffer).fileStart = 0;
    mp4boxInputFile.appendBuffer(this.result as MP4ArrayBuffer);
    mp4boxInputFile.flush();
  };
  reader.readAsArrayBuffer(file);

  return new Promise<ReturnType>((resolve, reject) => {
    mp4boxInputFile.onError = (error) => {
      reject(error);
    };

    mp4boxInputFile.onReady = async (info) => {
      resolve({ mp4boxInputFile, info });
    };
  });
};
