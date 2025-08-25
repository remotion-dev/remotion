export const parseFfmpegProgress = (
  input: string,
  fps: number,
): number | undefined => {
  const match = input.match(/frame=(\s+)?([0-9]+)\s/);
  if (match) {
    return Number(match[2]);
  }

  const match2 = input.match(/time=(\d+):(\d+):(\d+).(\d+)\s/);
  if (match2) {
    const [, hours, minutes, seconds, hundreds] = match2;
    return (
      (Number(hundreds) / 100) * fps +
      Number(seconds) * fps +
      Number(minutes) * fps * 60 +
      Number(hours) * fps * 60 * 60
    );
  }
};
