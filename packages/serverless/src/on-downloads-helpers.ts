import type {LogLevel, RenderMediaOnDownload} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

export const onDownloadsHelper = (
	logLevel: LogLevel,
): RenderMediaOnDownload => {
	const downloads: Record<string, number> = {};

	return (src: string) => {
		RenderInternals.Log.info({indent: false, logLevel}, 'Downloading', src);
		downloads[src] = 0;
		return ({percent, downloaded}) => {
			if (percent === null) {
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`Download progress (${src}): ${downloaded} bytes. Don't know final size of download, no Content-Length header.`,
				);
				return;
			}

			if (
				// Only report every 10% change
				downloads[src] > percent - 0.1 &&
				percent !== 1
			) {
				return;
			}

			downloads[src] = percent;
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`Download progress (${src}): ${downloaded} bytes, ${(
					percent * 100
				).toFixed(1)}%`,
			);
			if (percent === 1) {
				RenderInternals.Log.info(
					{indent: false, logLevel},
					`Download complete: ${src}`,
				);
			}
		};
	};
};
