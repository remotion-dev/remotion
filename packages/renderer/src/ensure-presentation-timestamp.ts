import execa from 'execa';
import {rename, unlink} from 'fs/promises';
import path from 'path';

const ensureFileHasPresentationTimestamp: Record<string, 'encoding' | 'done'> =
	{};

type Callback = {
	src: string;
	fn: () => void;
};

let callbacks: Callback[] = [];

export const ensurePresentationTimestamps = async (src: string) => {
	if (ensureFileHasPresentationTimestamp[src] === 'encoding') {
		return new Promise((resolve) => {
			callbacks.push({
				src,
				fn: () => resolve,
			});
		});
	}

	if (ensureFileHasPresentationTimestamp[src] === 'done') {
		return;
	}

	ensureFileHasPresentationTimestamp[src] = 'encoding';

	const parts = src.split(path.sep);
	const output = parts
		.map((p, i) => {
			if (i === parts.length - 1) {
				return `pts-${p}`;
			}
			return p;
		})
		.join(path.sep);

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
