import {makeProgressBar} from './make-progress-bar';
import {DownloadProgress} from './progress-bar';

export const makeMultiDownloadProgress = (progresses: DownloadProgress[]) => {
	if (progresses.length === 0) {
		return null;
	}

	if (progresses.length === 1) {
		const [progress] = progresses;
		return [
			`    +`,
			makeProgressBar(progress.progress),
			`Downloading ${progress.name}`,
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
