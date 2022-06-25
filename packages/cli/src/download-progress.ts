import {makeProgressBar} from './make-progress-bar';
import type {DownloadProgress} from './progress-bar';

export const makeMultiDownloadProgress = (progresses: DownloadProgress[]) => {
	if (progresses.length === 0) {
		return null;
	}

	if (progresses.length === 1) {
		const [progress] = progresses;
		const truncatedFileName =
			progress.name.length >= 100
				? progress.name.substring(0, 97) + '...'
				: progress.name;
		return [
			`    +`,
			makeProgressBar(progress.progress),
			`Downloading ${truncatedFileName}`,
		].join(' ');
	}

	return [
		`    +`,
		makeProgressBar(
			progresses.reduce((a, b) => a + b.progress, 0) / progresses.length
		),
		`Downloading ${progresses.length} files`,
	].join(' ');
};
