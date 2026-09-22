import {isValidElementAssetPath} from './element-drag-data';

export const staticFileRef = (path: string, previewSrc: string): string => {
	if (typeof path !== 'string' || !isValidElementAssetPath(path)) {
		throw new TypeError(
			'staticFileRef() path must be a safe Element asset path',
		);
	}

	if (typeof previewSrc !== 'string' || previewSrc.length === 0) {
		throw new TypeError(
			'staticFileRef() previewSrc must be a non-empty string',
		);
	}

	return previewSrc;
};
