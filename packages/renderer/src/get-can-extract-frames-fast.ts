import fs from 'fs';
import {getVideoStreamDurationwithoutCache} from './assets/get-video-stream-duration';
import {ensurePresentationTimestampWithoutCache} from './ensure-presentation-timestamp';
import {getVideoInfoUncached} from './get-video-info';
import {tryToExtractFrameOfVideoFast} from './try-to-extract-frame-of-video-fast';

export const ACCEPTABLE_OFFSET_THRESHOLD = 50;

export const getCanExtractFramesFast = async ({
	src,
}: {
	src: string;
}): Promise<{
	canExtractFramesFast: boolean;
	shouldReencode: boolean;
}> => {
	const out = await ensurePresentationTimestampWithoutCache({
		src,
	});
	const {specialVcodecForTransparency: specialVcodec} =
		await getVideoInfoUncached({
			src: out,
		});

	if (specialVcodec === 'vp8') {
		fs.unlinkSync(out);
		return {
			canExtractFramesFast: false,
			shouldReencode: false,
		};
	}

	const {duration} = await getVideoStreamDurationwithoutCache({
		src: out,
	});

	if (duration === null) {
		fs.unlinkSync(out);
		throw new Error(
			`Could not determine the duration of ${src} using FFMPEG. The file is not supported.`
		);
	}

	const actualOffset = `${duration * 1000 - ACCEPTABLE_OFFSET_THRESHOLD}ms`;

	const [stdErr] = await tryToExtractFrameOfVideoFast({
		actualOffset,
		imageFormat: 'jpeg',
		// Intentionally leaving needsResize as null, because we don't need to resize
		needsResize: null,
		specialVCodecForTransparency: specialVcodec,
		src: out,
	});
	fs.unlinkSync(out);

	const isEmpty = stdErr.includes('Output file is empty');

	if (isEmpty) {
		return {
			canExtractFramesFast: false,
			shouldReencode: true,
		};
	}

	return {
		canExtractFramesFast: true,
		shouldReencode: false,
	};
};
