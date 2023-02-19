import path from 'path';
import {RenderInternals} from '.';
import type {DownloadMap} from './assets/download-map';
import {guessExtensionForVideo} from './guess-extension-for-media';
import {truthy} from './truthy';

type Callback = {
	src: string;
	fn: (newsrc: string) => void;
};

let callbacks: Callback[] = [];

const getTemporaryOutputName = async ({src}: {src: string}) => {
	const parts = src.split(path.sep);

	// If there is no file extension for the video, then we need to temporarily add an extension

	const lastPart = parts[parts.length - 1];
	const extraExtension = lastPart.includes('.')
		? null
		: await guessExtensionForVideo({
				src,
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

export const ensurePresentationTimestampWithoutCache = async ({
	src,
}: {
	src: string;
}) => {
	// If there is no file extension for the video, then we need to tempoa
	const output = await getTemporaryOutputName({
		src,
	});

	await RenderInternals.callFf('ffmpeg', [
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
	]);

	return output;
};

export const ensurePresentationTimestamps = async ({
	downloadMap,
	src,
}: {
	downloadMap: DownloadMap;
	src: string;
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

	const output = await ensurePresentationTimestampWithoutCache({
		src,
	});

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
