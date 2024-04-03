import type {LogLevel, OnBrowserDownload} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {Log} from './log';

export const defaultBrowserDownloadProgress =
	(indent: boolean, logLevel: LogLevel): OnBrowserDownload =>
	() => {
		Log.info({indent, logLevel}, 'No local browser could be found.');
		Log.info(
			{indent, logLevel},
			'Downloading Chrome Headless Shell https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell',
		);

		return {
			version: null,
			onProgress: (progress) => {
				let lastProgress = 0;
				if (progress.downloaded > lastProgress + 10_000_000) {
					lastProgress = progress.downloaded;

					Log.info(
						{indent, logLevel},
						`Downloading Chrome Headless Shell - ${RenderInternals.toMegabytes(
							progress.downloaded,
						)}/${RenderInternals.toMegabytes(progress.totalSize as number)}`,
					);
				}
			},
		};
	};
