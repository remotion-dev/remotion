import type {OriginalPosition} from '../../../error-overlay/react-overlay/utils/get-source-map';

export const getOriginalSourceAttribution = (
	originalLocation: OriginalPosition,
) => {
	if (!originalLocation.source) {
		return '';
	}

	const split = originalLocation.source.split('/');
	const last = split[split.length - 1];
	if (last.startsWith('index')) {
		const lastTwo = split[split.length - 2];
		return `${lastTwo}/${last}:${originalLocation.line}`;
	}

	return `${last}:${originalLocation.line}`;
};
