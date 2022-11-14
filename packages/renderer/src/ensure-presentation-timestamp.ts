import execa from 'execa';
import path from 'path';
import type {DownloadMap} from './assets/download-map';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {getExecutableBinary} from './ffmpeg-flags';
import {guessExtensionForVideo} from './guess-extension-for-media';
import {truthy} from './truthy';

type Callback = {
	src: string;
	fn: (newsrc: string) => void;
};

let callbacks: Callback[] = [];

const getTemporaryOutputName = async ({
	src,
	remotionRoot,
	ffprobeBinary,
}: {
	src: string;
	remotionRoot: string;
	ffprobeBinary: string | null;
}) => {
	const parts = src.split(path.sep);

	// If there is no file extension for the video, then we need to temporarily add an extension

	const lastPart = parts[parts.length - 1];
	const extraExtension = lastPart.includes('.')
		? null
		: await guessExtensionForVideo({
				src,
				remotionRoot,
				ffprobeBinary,
		  });

	return parts
		.map((p, i) => {
			if (i === parts.length - 1) {
				return [`pts-${p}`, extraExtension].filter(truthy).join('.');
			}

			return p;
		})
		.join(path.sep);
};

export const ensurePresentationTimestamps = async ({
	downloadMap,
	src,
	remotionRoot,
	ffmpegExecutable,
	ffprobeExecutable,
}: {
	downloadMap: DownloadMap;
	src: string;
	remotionRoot: string;
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
}): Promise<string> => {
	const elem = downloadMap.ensureFileHasPresentationTimestamp[src];
	if (elem?.type === 'encoding') {
		return new Promise<string>((resolve) => {
			callbacks.push({
				src,
				fn: (newSrc: string) => resolve(newSrc),
			});
		});
	}

	if (elem?.type === 'done') {
		return elem.src;
	}

	downloadMap.ensureFileHasPresentationTimestamp[src] = {type: 'encoding'};

	// If there is no file extension for the video, then we need to tempoa
	const output = await getTemporaryOutputName({
		src,
		remotionRoot,
		ffprobeBinary: ffprobeExecutable,
	});

	await execa(
		await getExecutableBinary(ffmpegExecutable, remotionRoot, 'ffmpeg'),
		[
			'-i',
			src,
			'-fflags',
			'+genpts+igndts',
			'-vcodec',
			'copy',
			'-acodec',
			'copy',
			output,
			'-y',
		]
	);

	callbacks = callbacks.filter((c) => {
		if (c.src === src) {
			c.fn(output);
			return false;
		}

		return true;
	});
	downloadMap.ensureFileHasPresentationTimestamp[src] = {
		type: 'done',
		src: output,
	};
	return output;
};
