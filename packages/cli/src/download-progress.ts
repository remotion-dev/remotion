import type {DownloadProgress} from '@remotion/studio-server';
import {StudioServerInternals} from '@remotion/studio-server';
import {makeProgressBar} from './make-progress-bar';
import {LABEL_WIDTH} from './progress-bar';
import {truthy} from './truthy';

export const getFileSizeDownloadBar = (downloaded: number) => {
	const desiredLength = makeProgressBar(0).length;

	return `${StudioServerInternals.formatBytes(downloaded).padEnd(
		desiredLength - 2,
		' ',
	)}`;
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
			`Downloading assets`.padEnd(LABEL_WIDTH, ' '),
			progress.progress
				? makeProgressBar(progress.progress)
				: getFileSizeDownloadBar(progress.downloaded),
			truncatedFileName,
		]
			.filter(truthy)
			.join(' ');
	}

	const everyFileHasContentLength = progresses.every(
		(p) => p.totalBytes !== null,
	);

	return [
		`Downloading assets`.padEnd(LABEL_WIDTH, ' '),
		everyFileHasContentLength
			? makeProgressBar(
					progresses.reduce((a, b) => a + (b.progress as number), 0) /
						progresses.length,
				)
			: getFileSizeDownloadBar(
					progresses.reduce((a, b) => a + b.downloaded, 0),
				),
		`${progresses.length} files`,
	]
		.filter(truthy)
		.join(' ');
};
