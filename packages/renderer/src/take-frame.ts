import type {Page} from './browser/BrowserPage';
import type {StillImageFormat, VideoImageFormat} from './image-format';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {screenshot} from './puppeteer-screenshot';
import type {
	CapturedFrame,
	RemotionSharedMemoryCapture,
} from './remotion-shared-memory';

type TakeFrameOptions = {
	freePage: Page;
	imageFormat: VideoImageFormat | StillImageFormat;
	jpegQuality: number | undefined;
	height: number;
	width: number;
	output: string | null;
	scale: number;
	wantsBuffer: boolean;
	timeoutInMilliseconds: number;
	remotionSharedMemory: RemotionSharedMemoryCapture | null;
};

type TakeFrameResult<T extends RemotionSharedMemoryCapture | null> =
	T extends null ? Buffer | null : CapturedFrame | null;

export const takeFrame = async <T extends RemotionSharedMemoryCapture | null>({
	freePage,
	imageFormat,
	jpegQuality,
	width,
	height,
	output,
	scale,
	wantsBuffer,
	timeoutInMilliseconds,
	remotionSharedMemory,
}: Omit<TakeFrameOptions, 'remotionSharedMemory'> & {
	remotionSharedMemory: T;
}): Promise<TakeFrameResult<T>> => {
	if (imageFormat === 'none') {
		return null as TakeFrameResult<T>;
	}

	if (
		imageFormat === 'png' ||
		imageFormat === 'pdf' ||
		imageFormat === 'webp'
	) {
		await puppeteerEvaluateWithCatch({
			pageFunction: () => {
				document.body.style.background = 'transparent';
			},
			args: [],
			frame: null,
			page: freePage,
			timeoutInMilliseconds,
		});
	} else {
		await puppeteerEvaluateWithCatch({
			pageFunction: () => {
				document.body.style.background = 'black';
			},
			args: [],
			frame: null,
			page: freePage,
			timeoutInMilliseconds,
		});
	}

	const buf = await screenshot({
		page: freePage,
		omitBackground: imageFormat === 'png' || imageFormat === 'webp',
		path: (wantsBuffer ? undefined : output) ?? undefined,
		type: imageFormat,
		jpegQuality,
		width,
		height,
		scale,
		remotionSharedMemory,
	});

	return buf as TakeFrameResult<T>;
};
