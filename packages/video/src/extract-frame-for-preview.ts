import {extractFrame} from './extract-frame';
import type {LogLevel} from './log';

export const extractFrameForPreview = async ({
	src,
	timestamp,
	logLevel,
}: {
	src: string;
	timestamp: number;
	logLevel: LogLevel;
}): Promise<ImageBitmap | null> => {
	const sample = await extractFrame({
		src,
		timestamp,
		logLevel,
	});

	if (!sample) {
		return null;
	}

	const videoFrame = sample.toVideoFrame();
	const imageBitmap = await createImageBitmap(videoFrame);

	videoFrame.close();

	return imageBitmap;
};
