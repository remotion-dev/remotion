import type {LogLevel, OnBrowserDownload} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {chalk} from './chalk';
import {Log} from './log';
import {makeProgressBar} from './make-progress-bar';
import {LABEL_WIDTH, createOverwriteableCliOutput} from './progress-bar';
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
		`${doneIn ? 'Got' : 'Getting'} Headless Shell`.padEnd(LABEL_WIDTH, ' '),
		makeProgressBar(progress, false),
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
	return ({chromeMode}) => {
		if (chromeMode === 'chrome-for-testing') {
			Log.info(
				{indent, logLevel},
				'Downloading Chrome for Testing https://www.remotion.dev/chrome-for-testing',
			);
		} else {
			Log.info(
				{indent, logLevel},
				chalk.gray(
					'Downloading Chrome Headless Shell https://www.remotion.dev/chrome-headless-shell',
				),
			);
		}

		const updatesDontOverwrite = shouldUseNonOverlayingLogger({logLevel});

		const productName =
			chromeMode === 'chrome-for-testing'
				? 'Chrome for Testing'
				: 'Headless Shell';

		if (updatesDontOverwrite) {
			let lastProgress = 0;
			return {
				version: null,
				onProgress: (progress) => {
					if (progress.downloadedBytes > lastProgress + 10_000_000) {
						lastProgress = progress.downloadedBytes;

						Log.info(
							{indent, logLevel},
							`Getting ${productName} - ${RenderInternals.toMegabytes(
								progress.downloadedBytes,
							)}/${RenderInternals.toMegabytes(
								progress.totalSizeInBytes as number,
							)}`,
						);
					}

					if (progress.percent === 1) {
						Log.info({indent, logLevel}, `Got ${productName}`);
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
					progress.percent === 1,
				);
			},
		};
	};
};
