const validRenderModes = ['png', 'h264', 'h265', 'vp8', 'vp9'] as const;

export type Codec = typeof validRenderModes[number];
export type CodecOrUndefined = Codec | undefined;

let codec: CodecOrUndefined = undefined;

export const getOutputCodecOrUndefined = (): CodecOrUndefined => {
	return codec;
};

export const getFinalOutputCodec = ({
	codec: inputCodec,
	fileExtension,
	emitWarning,
}: {
	codec: CodecOrUndefined;
	fileExtension: string | null;
	emitWarning: boolean;
}): Codec => {
	if (inputCodec === undefined && fileExtension === 'webm') {
		if (emitWarning) {
			console.info(
				'You have specified a .webm extension, using the VP8 encoder. Use --codec=vp9 to use the Vp9 encoder.'
			);
		}
		return 'vp8';
	}
	if (inputCodec === undefined && fileExtension === 'hevc') {
		if (emitWarning) {
			console.info(
				'You have specified a .hevc extension, using it using H265 encoder.'
			);
		}
		return 'h265';
	}
	return inputCodec ?? 'h264';
};

export const setOutputFormat = (newRenderMode: CodecOrUndefined) => {
	if (newRenderMode === undefined) {
		codec = undefined;
		return;
	}
	if (!validRenderModes.includes(newRenderMode)) {
		throw new Error(
			`Render mode must be one of the following: ${validRenderModes.join(
				', '
			)}, but got ${newRenderMode}`
		);
	}
	codec = newRenderMode;
};
