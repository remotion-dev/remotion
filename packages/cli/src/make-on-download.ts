import type {LogLevel, RenderMediaOnDownload} from '@remotion/renderer';
import {formatBytes} from './format-bytes';
import {Log} from './log';
import type {DownloadProgress} from './progress-types';

export const makeOnDownload = ({
	indent,
	logLevel,
	updatesDontOverwrite,
	downloads,
	updateRenderProgress,
}: {
	indent: boolean;
	logLevel: LogLevel;
	updatesDontOverwrite: boolean;
	downloads: DownloadProgress[];
	updateRenderProgress: (progress: {
		newline: boolean;
		printToConsole: boolean;
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
		Log.verboseAdvanced(
			{indent, logLevel},
			`Starting download [${nextDownloadIndex}]:`,
			src,
		);

		updateRenderProgress({
			newline: false,
			printToConsole: !updatesDontOverwrite,
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

			Log.verboseAdvanced(
				{indent, logLevel},
				`Download [${nextDownloadIndex}]:`,
				percent ? `${(percent * 100).toFixed(1)}%` : formatBytes(downloaded),
			);
			updateRenderProgress({
				newline: false,
				printToConsole: !updatesDontOverwrite,
			});
		};
	};
};
