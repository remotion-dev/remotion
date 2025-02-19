import type {DownloadProgress} from '@remotion/studio-server';
import {StudioServerInternals} from '@remotion/studio-server';
import {formatBytes} from '@remotion/studio-shared';
import {chalk} from './chalk';
import {makeHyperlink} from './hyperlinks/make-link';
import {makeProgressBar} from './make-progress-bar';
import {LABEL_WIDTH, getRightLabelWidth} from './progress-bar';
import {truthy} from './truthy';

export const getFileSizeDownloadBar = (downloaded: number) => {
	const desiredLength = makeProgressBar(0, true).length;

	return `${StudioServerInternals.formatBytes(downloaded).padEnd(
		desiredLength,
		' ',
	)}`;
};

export const makeMultiDownloadProgress = (
	progresses: DownloadProgress[],
	totalFrames: number,
) => {
	if (progresses.length === 0) {
		return null;
	}

	const everyFileHasContentLength = progresses.every(
		(p) => p.totalBytes !== null,
	);

	const isDone = progresses.every((p) => p.progress === 1);

	const topRow = [
		(isDone ? `Downloaded assets` : 'Downloading assets').padEnd(
			LABEL_WIDTH,
			' ',
		),
		everyFileHasContentLength
			? makeProgressBar(
					progresses.reduce((a, b) => a + (b.progress as number), 0) /
						progresses.length,
					false,
				)
			: getFileSizeDownloadBar(
					progresses.reduce((a, b) => a + b.downloaded, 0),
				),
		`${progresses.length} file${progresses.length === 1 ? '' : 's'}`.padStart(
			getRightLabelWidth(totalFrames),
			' ',
		),
	]
		.filter(truthy)
		.join(' ');

	const downloadsToShow = progresses
		.filter((p) => p.progress !== 1)
		.slice(0, 2);

	return [
		topRow,
		...downloadsToShow.map((toShow) => {
			const truncatedFileName =
				toShow.name.length >= 60
					? toShow.name.substring(0, 57) + '...'
					: toShow.name;

			return chalk.gray(
				`↓ ${formatBytes(toShow.downloaded).padEnd(8, ' ')} ${makeHyperlink({url: toShow.name, fallback: truncatedFileName, text: truncatedFileName})}`,
			);
		}),
	].join('\n');
};
