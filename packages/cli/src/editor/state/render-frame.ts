export const renderFrame = (frame: number, fps: number): string => {
	const minutes = Math.floor(frame / fps / 60);
	const remainingSec = frame - minutes * fps * 60;
	const seconds = Math.floor(remainingSec / fps);
	const frameAfterSec = Math.round(frame % fps);
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
		2,
		'0'
	)}.${String(frameAfterSec).padStart(2, '0')}`;
};
