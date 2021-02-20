const validRenderModes = ['png', 'h264', 'h265', 'vp8', 'vp9'] as const;

export type Codec = typeof validRenderModes[number];
export type CodecOrUndefined = Codec | undefined;

let format: CodecOrUndefined = undefined;

export const getOutputCodecOrUndefined = (): CodecOrUndefined => {
	return format;
};

export const getFinalOutputCodec = ({
	codec,
	fileExtension,
	emitWarning,
}: {
	codec: CodecOrUndefined;
	fileExtension: string | null;
	emitWarning: boolean;
}): Codec => {
	if (codec === undefined && fileExtension === 'webm') {
		if (emitWarning) {
			console.info(
				'You have specified a .webm extension, using the VP8 encoder. Use --codec=vp9 to use the Vp9 encoder.'
			);
		}
		return 'vp8';
	}
	if (codec === undefined && fileExtension === 'hevc') {
		if (emitWarning) {
			console.info(
				'You have specified a .hevc extension, using it using H265 encoder.'
			);
		}
		return 'h265';
	}
	return codec ?? 'h264';
};

export const setOutputFormat = (newRenderMode: CodecOrUndefined) => {
	if (newRenderMode === undefined) {
		format = undefined;
		return;
	}
	if (!validRenderModes.includes(newRenderMode)) {
		throw new Error(
			`Render mode must be one of the following: ${validRenderModes.join(
				', '
			)}, but got ${newRenderMode}`
		);
	}
	format = newRenderMode;
};
