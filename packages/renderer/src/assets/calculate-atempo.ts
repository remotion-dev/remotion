// Solving this problem of FFMPEG:
// https://trac.ffmpeg.org/wiki/How%20to%20speed%20up%20/%20slow%20down%20a%20video
// "The atempo filter is limited to using values between 0.5 and 2.0 (so it can slow it down to no less than half the original speed, and speed up to no more than double the input). If you need to, you can get around this limitation by stringing multiple atempo filters together. The following with quadruple the audio speed:"

export const calculateATempo = (playbackRate: number): string | null => {
	if (playbackRate === 1) {
		return null;
	}

	if (playbackRate >= 0.5 && playbackRate <= 2) {
		return `atempo=${playbackRate.toFixed(5)}`;
	}

	return `${calculateATempo(Math.sqrt(playbackRate))},${calculateATempo(
		Math.sqrt(playbackRate),
	)}`;
};
