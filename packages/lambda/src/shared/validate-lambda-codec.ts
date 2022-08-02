const lambdaCodecs = [
	'h264-mkv',
	'h264',
	'vp8',
	'mp3',
	'aac',
	'wav',
	'gif',
	'prores',
] as const;

export type LambdaCodec = typeof lambdaCodecs[number];

export const validateLambdaCodec = (codec: unknown): LambdaCodec => {
	if (typeof codec !== 'string') {
		throw new TypeError('"codec" must be a string ');
	}

	if (!(lambdaCodecs as readonly string[]).includes(codec)) {
		throw new TypeError(
			"'" +
				codec +
				"' is not a valid codec for Lambda. The following values are supported: " +
				lambdaCodecs.join(', ')
		);
	}

	if ((codec as LambdaCodec) === 'h264-mkv') {
		console.warn(
			'The "h264-mkv" codec for renderMediaOnLambda() is deprecated - it\'s now just "h264".'
		);

		return 'h264';
	}

	return codec as LambdaCodec;
};
