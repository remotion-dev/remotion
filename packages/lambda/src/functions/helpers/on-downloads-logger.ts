import type {RenderMediaOnDownload} from '@remotion/renderer';

export const onDownloadsHelper = (): RenderMediaOnDownload => {
	const downloads: Record<string, number> = {};

	return (src: string) => {
		console.log('Downloading', src);
		downloads[src] = 0;
		return ({percent, downloaded}) => {
			if (percent === null) {
				console.log(
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
			console.log(
				`Download progress (${src}): ${downloaded} bytes, ${(
					percent * 100
				).toFixed(1)}%`,
			);
			if (percent === 1) {
				console.log(`Download complete: ${src}`);
			}
		};
	};
};
