import type {DownloadBehavior} from './constants';

export const validateDownloadBehavior = (downloadBehavior: unknown) => {
	if (downloadBehavior === null || downloadBehavior === undefined) {
		return null;
	}

	if (typeof downloadBehavior !== 'object') {
		throw new Error('downloadBehavior must be null or an object');
	}

	const behavior = downloadBehavior as DownloadBehavior;
	if (behavior.type !== 'download' && behavior.type !== 'play-in-browser') {
		throw new Error(
			'Download behavior must be either "download" or "play-in-browser"',
		);
	}

	if (behavior.type === 'download') {
		if (typeof behavior.fileName !== 'string' && behavior.fileName !== null) {
			throw new Error(
				'If "downloadBehavior.type" is "download", then fileName must be "null" or a string',
			);
		}
	}
};
