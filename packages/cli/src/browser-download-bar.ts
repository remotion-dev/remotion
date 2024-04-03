import type {LogLevel, OnBrowserDownload} from '@remotion/renderer';
import {chalk} from './chalk';
import {Log} from './log';
import {makeProgressBar} from './make-progress-bar';
import {createOverwriteableCliOutput} from './progress-bar';
import {shouldUseNonOverlayingLogger} from './should-use-non-overlaying-logger';
import {truthy} from './truthy';

const makeDownloadProgress = ({
	bytesDownloaded,
	totalBytes,
	doneIn,
}: {
	totalBytes: number;
	bytesDownloaded: number;
	doneIn: number | null;
}) => {
	const progress = bytesDownloaded / totalBytes;

	return [
		`    +`,
		makeProgressBar(progress),
		`${doneIn ? 'Downloaded' : 'Downloading'} Chrome Headless Shell`,
		doneIn === null
			? (progress * 100).toFixed(0) + '%'
			: chalk.gray(`${doneIn}ms`),
	]
		.filter(truthy)
		.join(' ');
};

export const defaultBrowserDownloadProgress = ({
	indent,
	logLevel,
	quiet,
}: {
	indent: boolean;
	logLevel: LogLevel;
	quiet: boolean;
}): OnBrowserDownload => {
	return () => {
		Log.info({indent, logLevel}, 'No local browser could be found.');
		Log.info(
			{indent, logLevel},
			'Downloading Chrome Headless Shell https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell',
		);

		const cliOutput = createOverwriteableCliOutput({
			quiet,
			indent,
			cancelSignal: null,
			updatesDontOverwrite: shouldUseNonOverlayingLogger({logLevel}),
		});

		return {
			version: null,
			onProgress: (progress) => {
				cliOutput.update(
					makeDownloadProgress({
						doneIn: null,
						bytesDownloaded: progress.downloaded,
						totalBytes: progress.totalSize,
					}),
					false,
				);
			},
		};
	};
};
