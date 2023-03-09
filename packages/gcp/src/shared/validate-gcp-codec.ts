const gcpCodecs = [
	'h264',
	'vp8',
	'vp9',
	'mp3',
	'aac',
	'wav',
	'gif',
	'prores',
] as const;

export type GcpCodec = typeof gcpCodecs[number];

export const validateGcpCodec = (codec: unknown): GcpCodec => {
	if (typeof codec !== 'string') {
		throw new TypeError('"codec" must be a string ');
	}

	if (!(gcpCodecs as readonly string[]).includes(codec)) {
		throw new TypeError(
			"'" +
				codec +
				"' is not a valid codec for GCP Cloud Run. The following values are supported: " +
				gcpCodecs.join(', ')
		);
	}

	if ((codec as string) === 'h264-mkv') {
		console.warn(
			'The "h264-mkv" codec for renderMediaOnGcp() is deprecated - it\'s now just "h264".'
		);

		return 'h264';
	}

	return codec as GcpCodec;
};
