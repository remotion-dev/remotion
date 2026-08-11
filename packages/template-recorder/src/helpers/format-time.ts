export const formatMilliseconds = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const formattedSeconds = seconds % 60;
  const formattedMinutes = minutes % 60;

  const timeArray = [];

  if (hours > 0) {
    timeArray.push(hours.toString().padStart(2, "0"));
  }

  timeArray.push(formattedMinutes.toString().padStart(2, "0"));
  timeArray.push(formattedSeconds.toString().padStart(2, "0"));

  return timeArray.join(":");
};
