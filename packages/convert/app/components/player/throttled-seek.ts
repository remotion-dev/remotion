import type {MediaParserController} from '@remotion/media-parser';

export const throttledSeek = (controller: MediaParserController) => {
	let lastMediaParserSeek = 0;

	const mediaParserSeek = (timestamp: number) => {
		lastMediaParserSeek = timestamp;
		controller.seek(timestamp);
		controller.resume();
	};

	return {
		seek: (timestamp: number) => {
			mediaParserSeek(timestamp);
		},
		getLastSeek: () => {
			return lastMediaParserSeek;
		},
	};
};
