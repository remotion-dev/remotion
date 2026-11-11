export const renderFrame = (frame: number, fps: number): string => {
	const magnitude = Math.abs(frame);
	const roundedFrame = Math.round(magnitude);
	const timeInSeconds = magnitude / fps;
	const nearestSecond = Math.round(timeInSeconds);
	const elapsedSeconds =
		roundedFrame === Math.round(nearestSecond * fps)
			? nearestSecond
			: Math.floor(timeInSeconds);
	const hours = Math.floor(elapsedSeconds / 3600);
	const minutes = Math.floor(elapsedSeconds / 60) % 60;
	const seconds = elapsedSeconds % 60;
	const frameAfterSec = roundedFrame - Math.round(elapsedSeconds * fps);

	const sign = frame < 0 ? '-' : '';
	const hoursStr = hours > 0 ? `${hours}:` : '';
	const minutesStr = String(minutes).padStart(2, '0');
	const secondsStr = String(seconds).padStart(2, '0');
	const frameStr = String(frameAfterSec).padStart(2, '0');

	return `${sign}${hoursStr}${minutesStr}:${secondsStr}.${frameStr}`;
};
