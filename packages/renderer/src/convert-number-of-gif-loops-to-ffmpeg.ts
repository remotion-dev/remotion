// https://superuser.com/questions/1607099/how-to-control-gif-loop-settings-in-ffmpeg

export const convertNumberOfGifLoopsToFfmpegSyntax = (loops: number | null) => {
	// Infinite loop
	if (loops === null) {
		return '0';
	}

	// No loops
	if (loops === 0) {
		return '-1';
	}

	// N amount of loops
	return String(loops);
};
