export const renderFrame = (frame: number, fps: number): string => {
	const hours = Math.floor(frame / fps / 3600);

	const remainingMinutes = frame - hours * fps * 3600;
	const minutes = Math.floor(remainingMinutes / 60 / fps);

	const remainingSec = frame - hours * fps * 3600 - minutes * fps * 60;
	const seconds = Math.floor(remainingSec / fps);

	const frameAfterSec = Math.round(frame % fps);

	const hoursStr = String(hours);
	const minutesStr = String(minutes).padStart(2, '0');
	const secondsStr = String(seconds).padStart(2, '0');
	const frameStr = String(frameAfterSec).padStart(2, '0');

	if (hours > 0) {
		return `${hoursStr}:${minutesStr}:${secondsStr}.${frameStr}`;
	}

	return `${minutesStr}:${secondsStr}.${frameStr}`;
};
