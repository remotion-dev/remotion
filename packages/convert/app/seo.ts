import {
	ConvertMediaContainer,
	getAvailableContainers,
} from '@remotion/webcodecs';
import {renderHumanReadableContainer} from './lib/render-codec-label';

export const inputContainers: ConvertMediaContainer[] = ['mp4', 'webm'];
export const outputContainers = getAvailableContainers();

export const parseRouteAction = (action: string) => {
	const split = action.split('-to-');
	if (split.length !== 2) {
		throw new Error('Invalid action');
	}

	if (split[0] === split[1]) {
		throw new Error('Input and output container cannot be the same');
	}

	return {
		input: split[0] as ConvertMediaContainer,
		output: split[1] as ConvertMediaContainer,
	};
};

export type RouteAction = {
	type: 'convert';
	input: ConvertMediaContainer;
	output: ConvertMediaContainer;
};

export const getHeaderTitle = (routeAction: RouteAction | null) => {
	if (routeAction && routeAction.type === 'convert') {
		return `Fast ${renderHumanReadableContainer(routeAction.input)} → ${renderHumanReadableContainer(routeAction.output)} conversion in the browser`;
	}

	return 'Fast video conversion in the browser';
};

export const getPageTitle = (routeAction: RouteAction | null) => {
	if (routeAction === null) {
		return 'Remotion Convert – Fast video conversion in the browser';
	}

	return `Online ${renderHumanReadableContainer(routeAction.input)} to ${renderHumanReadableContainer(routeAction.output)} converter - Remotion Convert`;
};

export const getDescription = (routeAction: RouteAction | null) => {
	if (routeAction === null) {
		return 'The fastest online video converter, powered by WebCodecs. No upload required, no watermarks, no limits.';
	}

	return `The fastest online ${renderHumanReadableContainer(routeAction.input)} to ${renderHumanReadableContainer(routeAction.output)} converter, powered by WebCodecs. No upload required, no watermarks, no limits.`;
};
