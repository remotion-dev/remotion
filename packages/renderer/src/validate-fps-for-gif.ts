import type {Codec} from 'remotion';

export const validateFpsForGif = (codec: Codec, fps: number) => {
	if (codec === 'gif' && (fps > 50 || fps < 1)) {
		throw new Error(
			`To render a GIF, the FPS must be less than or equal to 50 and greater than 0 but got ${fps} instead`
		);
	}
};
