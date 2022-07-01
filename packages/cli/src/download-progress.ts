import {formatBytes} from './format-bytes';
import {makeProgressBar} from './make-progress-bar';
import type {DownloadProgress} from './progress-bar';

export const getFileSizeDownloadBar = (downloaded: number) => {
	const desiredLength = makeProgressBar(0).length;

	return `[${formatBytes(downloaded).padEnd(desiredLength - 2, ' ')}]`;
};

export const makeMultiDownloadProgress = (progresses: DownloadProgress[]) => {
	if (progresses.length === 0) {
		return null;
	}

	if (progresses.length === 1) {
		const [progress] = progresses;
		const truncatedFileName =
			progress.name.length >= 60
				? progress.name.substring(0, 57) + '...'
				: progress.name;
		return [
			`    +`,
			progress.progress
				? makeProgressBar(progress.progress)
				: getFileSizeDownloadBar(progress.downloaded),
			`Downloading ${truncatedFileName}`,
		].join(' ');
	}

	const everyFileHasContentLength = progresses.every(
		(p) => p.totalBytes !== null
	);

	return [
		`    +`,
		everyFileHasContentLength
			? makeProgressBar(
					progresses.reduce((a, b) => a + (b.progress as number), 0) /
						progresses.length
			  )
			: getFileSizeDownloadBar(
					progresses.reduce((a, b) => a + b.downloaded, 0)
			  ),
		`Downloading ${progresses.length} files`,
	].join(' ');
};
