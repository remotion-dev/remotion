import fs from 'fs';
import {getVideoStreamDurationwithoutCache} from './assets/get-video-stream-duration';
import {ensurePresentationTimestampWithoutCache} from './ensure-presentation-timestamp';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {findRemotionRoot} from './find-closest-package-json';
import {getVideoInfoUncached} from './get-video-info';
import {tryToExtractFrameOfVideoFast} from './try-to-extract-frame-of-video-fast';

export const ACCEPTABLE_OFFSET_THRESHOLD = 50;

export const getCanExtractFramesFast = async ({
	src,
	ffmpegExecutable,
	ffprobeExecutable,
}: {
	src: string;
	ffmpegExecutable?: FfmpegExecutable;
	ffprobeExecutable?: FfmpegExecutable;
}): Promise<{
	canExtractFramesFast: boolean;
	shouldReencode: boolean;
}> => {
	const remotionRoot = findRemotionRoot();
	const out = await ensurePresentationTimestampWithoutCache({
		ffmpegExecutable: ffmpegExecutable ?? null,
		ffprobeExecutable: ffprobeExecutable ?? null,
		remotionRoot,
		src,
	});
	const {specialVcodecForTransparency: specialVcodec} =
		await getVideoInfoUncached({
			src: out,
			ffprobeExecutable: ffprobeExecutable ?? null,
			remotionRoot,
		});

	if (specialVcodec === 'vp8') {
		fs.unlinkSync(out);
		return {
			canExtractFramesFast: false,
			shouldReencode: false,
		};
	}

	const {duration} = await getVideoStreamDurationwithoutCache({
		ffprobeExecutable: ffprobeExecutable ?? null,
		remotionRoot,
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
		ffmpegExecutable: ffmpegExecutable ?? null,
		imageFormat: 'jpeg',
		// Intentionally leaving needsResize as null, because we don't need to resize
		needsResize: null,
		remotionRoot,
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
