import type {LogLevel} from '../log-level';
import {Log} from '../logger';
import type {OnBrowserDownload} from '../options/on-browser-download';
import {toMegabytes} from '../to-megabytes';

export const defaultBrowserDownloadProgress =
	({
		indent,
		logLevel,
		api,
	}: {
		indent: boolean;
		logLevel: LogLevel;
		api: string;
	}): OnBrowserDownload =>
	({chromeMode}) => {
		// onBrowserDownload() is also called when the browser is already
		// installed, so only log once a download starts.
		let started = false;
		let lastProgress = 0;
		return {
			onProgress: (progress) => {
				if (!started) {
					started = true;
					if (chromeMode === 'chrome-for-testing') {
						Log.info(
							{indent, logLevel},
							'Downloading Chrome for Testing https://www.remotion.dev/chrome-for-testing',
						);
					} else {
						Log.info(
							{indent, logLevel},
							'Downloading Chrome Headless Shell https://www.remotion.dev/chrome-headless-shell',
						);
					}

					Log.info(
						{indent, logLevel},
						`Customize this behavior by adding a onBrowserDownload function to ${api}.`,
					);
				}

				if (
					progress.downloadedBytes > lastProgress + 10_000_000 ||
					progress.percent === 1
				) {
					lastProgress = progress.downloadedBytes;
					if (chromeMode === 'chrome-for-testing') {
						Log.info(
							{indent, logLevel},
							`Downloading Chrome for Testing - ${toMegabytes(
								progress.downloadedBytes,
							)}/${toMegabytes(progress.totalSizeInBytes as number)}`,
						);
					} else {
						Log.info(
							{indent, logLevel},
							`Downloading Chrome Headless Shell - ${toMegabytes(
								progress.downloadedBytes,
							)}/${toMegabytes(progress.totalSizeInBytes as number)}`,
						);
					}
				}
			},
			version: null,
		};
	};
