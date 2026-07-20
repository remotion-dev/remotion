export const getCurrentTime = ({
	frame,
	playbackRate,
	fps,
}: {
	frame: number;
	playbackRate: number;
	fps: number;
}) => {
	return (frame * playbackRate) / fps;
};
