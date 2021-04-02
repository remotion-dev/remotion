export const getCurrentTime = ({
	fps,
	frame,
	src,
}: {
	fps: number;
	frame: number;
	src: string;
}) => {
	if (src.endsWith('mp4')) {
		// In Chrome, if 30fps, the first frame is still displayed at 0.033333
		// even though after that it increases by 0.033333333 each.
		// So frame = 0 in Remotion is like frame = 1 for the browser
		return (frame + 1) / fps;
	}
	const msPerFrame = 1000 / fps;
	const msShift = msPerFrame / 2;
	return (frame * msPerFrame + msShift) / 1000;
};
