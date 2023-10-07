const cloudrunCodecs = [
	'h264',
	'vp8',
	'vp9',
	'mp3',
	'aac',
	'wav',
	'gif',
	'prores',
] as const;

export type CloudrunCodec = (typeof cloudrunCodecs)[number];

export const validateCloudrunCodec = (codec: unknown): CloudrunCodec => {
	if (typeof codec !== 'string') {
		throw new TypeError('"codec" must be a string ');
	}

	if (!(cloudrunCodecs as readonly string[]).includes(codec)) {
		throw new TypeError(
			"'" +
				codec +
				"' is not a valid codec for GCP Cloud Run. The following values are supported: " +
				cloudrunCodecs.join(', '),
		);
	}

	if (codec === 'h264-mkv') {
		throw new Error(
			'The "h264-mkv" codec for renderMediaOnCloudrun() is deprecated - it\'s now just "h264".',
		);
	}

	return codec as CloudrunCodec;
};
