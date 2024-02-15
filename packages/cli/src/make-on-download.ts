import type {LogLevel, RenderMediaOnDownload} from '@remotion/renderer';
import type {DownloadProgress} from '@remotion/studio-server';
import {StudioServerInternals} from '@remotion/studio-server';
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
	return (src) => {
		const id = Math.random();
		const download: DownloadProgress = {
			id,
			name: src,
			progress: 0,
			downloaded: 0,
			totalBytes: null,
		};
		const nextDownloadIndex = downloads.length;
		downloads.push(download);
		Log.verbose(
			{indent, logLevel},
			`Starting download [${nextDownloadIndex}]:`,
			src,
		);

		updateRenderProgress({
			newline: false,
			printToConsole: !updatesDontOverwrite,
			isUsingParallelEncoding,
		});
		let lastUpdate = Date.now();
		return ({percent, downloaded, totalSize}) => {
			download.progress = percent;
			download.totalBytes = totalSize;
			download.downloaded = downloaded;
			if (lastUpdate + 1000 > Date.now() && updatesDontOverwrite) {
				return;
			}

			lastUpdate = Date.now();

			Log.verbose(
				{indent, logLevel},
				`Download [${nextDownloadIndex}]:`,
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
	};
};
