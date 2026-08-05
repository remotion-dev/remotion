import {createImageDecoder} from './create-image-decoder';

export const getAnimatedImageDurationInSeconds = async ({
	resolvedSrc,
	signal,
	requestInit,
	contentType,
}: {
	resolvedSrc: string;
	signal: AbortSignal;
	requestInit?: RequestInit;
	contentType: string | null;
}) => {
	const {decoder, selectedTrack} = await createImageDecoder({
		resolvedSrc,
		signal,
		requestInit,
		contentType,
	});

	try {
		const {image} = await decoder.decode({
			frameIndex: selectedTrack.frameCount - 1,
			completeFramesOnly: true,
		});

		try {
			if (image.duration === null) {
				throw new Error('Could not determine animated image duration');
			}

			return (image.timestamp + image.duration) / 1_000_000;
		} finally {
			image.close();
		}
	} finally {
		decoder.close();
	}
};
