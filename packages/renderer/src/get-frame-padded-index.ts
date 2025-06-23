// Determines the filenames for frames that get rendered.
// - If passed to FFMPEG, they should be consecutive: element-000.jpg, element-001.jpg, element-002.jpg
// - If `--every-nth-frame` is passed, only frames 0, 2, 4 are rendered
// - If an image sequence is created, the filenames should correspond to the frame numbers: element-099.jpg, element-100.jpg

import type {VideoImageFormat} from './image-format';

export type CountType = 'from-zero' | 'actual-frames';

export const getFrameOutputFileNameFromPattern = ({
	pattern,
	frame,
	ext,
}: {
	pattern: string;
	frame: string;
	ext: string;
}) => {
	return pattern.replace(/\[frame\]/g, frame).replace(/\[ext\]/g, ext);
};

export const getFrameOutputFileName = ({
	index,
	frame,
	imageFormat,
	countType,
	lastFrame,
	totalFrames,
	imageSequencePattern,
}: {
	index: number;
	frame: number;
	imageFormat: VideoImageFormat;
	countType: CountType;
	lastFrame: number;
	totalFrames: number;
	imageSequencePattern: string | null;
}) => {
	const filePadLength = getFilePadLength({lastFrame, countType, totalFrames});
	const frameStr =
		countType === 'actual-frames'
			? String(frame).padStart(filePadLength, '0')
			: String(index).padStart(filePadLength, '0');
	if (imageSequencePattern) {
		return getFrameOutputFileNameFromPattern({
			pattern: imageSequencePattern,
			frame: frameStr,
			ext: imageFormat,
		});
	}

	const prefix = 'element';
	if (countType === 'actual-frames') {
		return `${prefix}-${frameStr}.${imageFormat}`;
	}

	if (countType === 'from-zero') {
		return `${prefix}-${frameStr}.${imageFormat}`;
	}

	throw new TypeError('Unknown count type');
};

export const getFilePadLength = ({
	lastFrame,
	totalFrames,
	countType,
}: {
	lastFrame: number;
	totalFrames: number;
	countType: CountType;
}) => {
	if (countType === 'actual-frames') {
		return String(lastFrame).length;
	}

	if (countType === 'from-zero') {
		return String(totalFrames - 1).length;
	}

	throw new Error('Unknown file type');
};
