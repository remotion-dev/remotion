import type {CanvasContent} from 'remotion';
import {getRoute} from '../helpers/url-state';

export const deriveCanvasContentFromUrl = (): CanvasContent | null => {
	const route = getRoute();
	const substrings = route.split('/').filter(Boolean);

	// CJK-named composition IDs are not automatically reselected after page refresh
	const lastPart = substrings[substrings.length - 1];

	if (substrings[0] === 'assets') {
		return {
			type: 'asset',
			asset: decodeURIComponent(route.substring('/assets/'.length)),
		};
	}

	if (substrings[0] === 'outputs') {
		return {
			type: 'output',
			path: decodeURIComponent(route.substring('/outputs/'.length)),
		};
	}

	if (lastPart) {
		return {
			type: 'composition',
			compositionId: decodeURIComponent(lastPart),
		};
	}

	return null;
};
