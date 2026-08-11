export const getSamplesPerMpegFrame = ({
	mpegVersion,
	layer,
}: {
	mpegVersion: 1 | 2;
	layer: number;
}) => {
	if (mpegVersion === 1) {
		if (layer === 1) {
			return 384;
		}

		if (layer === 2 || layer === 3) {
			return 1152;
		}
	}

	if (mpegVersion === 2) {
		if (layer === 1) {
			return 384;
		}

		if (layer === 2) {
			return 1152;
		}

		if (layer === 3) {
			return 576;
		}
	}

	throw new Error('Invalid MPEG layer');
};
