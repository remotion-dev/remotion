export const enumerateDevicesOrTimeOut = async () => {
  let clear = () => undefined;

  const timeOut = new Promise<MediaDeviceInfo[]>((_, reject) => {
    const int = setTimeout(() => {
      reject(
        new Error(
          "navigator.mediaDevices.enumerateDevices() has not responded within 10000ms. Usually this can be fixed by restarting your browser.",
        ),
      );
    }, 10000);

    clear = () => {
      clearTimeout(int);
    };
  });

  const result = await Promise.race<MediaDeviceInfo[]>([
    timeOut,
    navigator.mediaDevices.enumerateDevices(),
  ]);
  clear();
  return result;
};
