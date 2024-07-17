import type {LogLevel, OnBrowserDownload} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
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
		makeProgressBar(progress, false),
		`${doneIn ? 'Got' : 'Getting'} Headless Shell`,
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
			'Downloading Chrome Headless Shell https://www.remotion.dev/chrome-headless-shell',
		);

		const updatesDontOverwrite = shouldUseNonOverlayingLogger({logLevel});

		if (updatesDontOverwrite) {
			let lastProgress = 0;
			return {
				version: null,
				onProgress: (progress) => {
					if (progress.downloadedBytes > lastProgress + 10_000_000) {
						lastProgress = progress.downloadedBytes;

						Log.info(
							{indent, logLevel},
							`Getting Headless Shell - ${RenderInternals.toMegabytes(
								progress.downloadedBytes,
							)}/${RenderInternals.toMegabytes(
								progress.totalSizeInBytes as number,
							)}`,
						);
					}

					if (progress.percent === 1) {
						Log.info({indent, logLevel}, `Got Headless Shell`);
					}
				},
			};
		}

		const cliOutput = createOverwriteableCliOutput({
			quiet,
			indent,
			cancelSignal: null,
			updatesDontOverwrite,
		});

		const startedAt = Date.now();
		let doneIn: number | null = null;

		return {
			version: null,
			onProgress: (progress) => {
				if (progress.percent === 1) {
					doneIn = Date.now() - startedAt;
				}

				cliOutput.update(
					makeDownloadProgress({
						doneIn,
						bytesDownloaded: progress.downloadedBytes,
						totalBytes: progress.totalSizeInBytes,
					}),
					false,
				);
			},
		};
	};
};
