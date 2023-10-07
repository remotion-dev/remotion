// FFMPEG allows expressions to have a maximum depth of 100.
// As defined here: https://github.com/FFmpeg/FFmpeg/blob/2014b0135293c41d261757bfa1aaba51653bab8e/libavutil/eval.c#L706
// With one depth added by the if/else statement,
// this means we can have a maximum of 99 different volumes.
// Therefore we round the volumes (which can only be between 0 and 1)
// so that there are only 99 possible values.
// We then subtract 1 again because FFMPEG is not precise and queries out of range
// values, for which we have to provide a default

const MAX_FFMPEG_STACK_DEPTH = 98;

export const roundVolumeToAvoidStackOverflow = (volume: number): number => {
	return Number(
		(
			Math.round(volume * (MAX_FFMPEG_STACK_DEPTH - 1)) /
			(MAX_FFMPEG_STACK_DEPTH - 1)
		).toFixed(3),
	);
};
