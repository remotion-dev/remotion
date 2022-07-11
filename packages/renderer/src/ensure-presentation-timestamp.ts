import execa from 'execa';
import {rename, unlink} from 'fs/promises';
import path from 'path';
import {Internals} from 'remotion';
import {guessExtensionForVideo} from './guess-extension-for-media';

const ensureFileHasPresentationTimestamp: Record<string, 'encoding' | 'done'> =
	{};

type Callback = {
	src: string;
	fn: () => void;
};

let callbacks: Callback[] = [];

const getTemporaryOutputName = async (src: string) => {
	const parts = src.split(path.sep);

	// If there is no file extension for the video, then we need to temporarily add an extension

	const lastPart = parts[parts.length - 1];
	const extraExtension = lastPart.includes('.')
		? null
		: await guessExtensionForVideo(src);

	return parts
		.map((p, i) => {
			if (i === parts.length - 1) {
				return [`pts-${p}`, extraExtension].filter(Internals.truthy).join('.');
			}

			return p;
		})
		.join(path.sep);
};

export const ensurePresentationTimestamps = async (src: string) => {
	if (ensureFileHasPresentationTimestamp[src] === 'encoding') {
		return new Promise<void>((resolve) => {
			callbacks.push({
				src,
				fn: () => resolve(),
			});
		});
	}

	if (ensureFileHasPresentationTimestamp[src] === 'done') {
		return;
	}

	ensureFileHasPresentationTimestamp[src] = 'encoding';

	// If there is no file extension for the video, then we need to tempoa
	const output = await getTemporaryOutputName(src);

	await execa('ffmpeg', [
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

	await unlink(src);
	await rename(output, src);

	callbacks = callbacks.filter((c) => {
		if (c.src === src) {
			c.fn();
			return false;
		}

		return true;
	});
	ensureFileHasPresentationTimestamp[src] = 'done';
};
