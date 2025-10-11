export const createFileStorage = async (filename: string) => {
  const directoryHandle = await navigator.storage.getDirectory();

  const fileHandle = await directoryHandle.getFileHandle(filename, {
    create: true,
  });
  const writable = await fileHandle.createWritable();

  let written = 0;
  let writPromise = Promise.resolve();

  const write = async (data: Uint8Array | Blob) => {
    await writable.write({
      type: "write",
      position: written,
      data: data,
    });
    written += data instanceof Blob ? data.size : data.byteLength;
  };

  return {
    write: async (data: Blob) => {
      writPromise = writPromise.then(() => write(data));
      return writPromise;
    },
    save: async () => {
      await writPromise;

      try {
        await writable.close();
      } catch {
        // Ignore, could already be closed
      }

      const newHandle = await directoryHandle.getFileHandle(filename, {
        create: true,
      });
      const newFile = await newHandle.getFile();
      return newFile;
    },
    getBytesWritten: () => written,
    release: async () => {
      try {
        await writable.close();
      } catch {
        // Ignore, could already be closed
      }
      await directoryHandle.removeEntry(filename, {
        recursive: true,
      });
    },
  };
};
