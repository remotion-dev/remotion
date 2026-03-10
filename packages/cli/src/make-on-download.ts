import type {LogLevel, RenderMediaOnDownload} from '@remotion/renderer';
import type {DownloadProgress} from '@remotion/studio-server';
import {StudioServerInternals} from '@remotion/studio-server';
import {makeDownloadProgressTracker} from '@remotion/studio-startup-core';
import {Log} from './log';

export const makeOnDownload = ({
	indent,
	logLevel,
	updatesDontOverwrite,
	downloads,
	updateRenderProgress,
	isUsingParallelEncoding,
}: {
	indent: boolean;
	logLevel: LogLevel;
	updatesDontOverwrite: boolean;
	downloads: DownloadProgress[];
	isUsingParallelEncoding: boolean;
	updateRenderProgress: (progress: {
		newline: boolean;
		printToConsole: boolean;
		isUsingParallelEncoding: boolean;
	}) => void;
}): RenderMediaOnDownload => {
	return makeDownloadProgressTracker({
		downloads,
		onDownloadStart: ({index, src}) => {
			Log.verbose({indent, logLevel}, `Starting download [${index}]:`, src);

			updateRenderProgress({
				newline: false,
				printToConsole: !updatesDontOverwrite,
				isUsingParallelEncoding,
			});

			let lastUpdate = Date.now();

			return ({percent, downloaded}) => {
				if (lastUpdate + 1000 > Date.now() && updatesDontOverwrite) {
					return;
				}

				lastUpdate = Date.now();

				Log.verbose(
					{indent, logLevel},
					`Download [${index}]:`,
					percent
						? `${(percent * 100).toFixed(1)}%`
						: StudioServerInternals.formatBytes(downloaded),
				);
				updateRenderProgress({
					newline: false,
					printToConsole: !updatesDontOverwrite,
					isUsingParallelEncoding,
				});
			};
		},
	});
};
