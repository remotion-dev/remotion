import {ParseMediaContainer} from '@remotion/media-parser';
import {
	ConvertMediaContainer,
	getAvailableContainers,
} from '@remotion/webcodecs';
import {renderHumanReadableContainer} from './lib/render-codec-label';

export const inputContainers: ParseMediaContainer[] = ['mp4', 'webm', 'avi'];
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

export type RouteAction =
	| {
			type: 'convert';
			input: ConvertMediaContainer | ParseMediaContainer;
			output: ConvertMediaContainer;
	  }
	| {
			type: 'generic-convert';
	  };

export const getHeaderTitle = (routeAction: RouteAction) => {
	if (routeAction.type === 'convert') {
		return `Fast ${renderHumanReadableContainer(routeAction.input)} → ${renderHumanReadableContainer(routeAction.output)} conversion in the browser`;
	}

	if (routeAction.type === 'generic-convert') {
		return 'Fast video conversion in the browser';
	}

	throw new Error('Invalid route action');
};

export const getPageTitle = (routeAction: RouteAction) => {
	if (routeAction.type === 'generic-convert') {
		return 'Remotion Convert – Fast video conversion in the browser';
	}

	if (routeAction.type === 'convert') {
		return `Online ${renderHumanReadableContainer(routeAction.input)} to ${renderHumanReadableContainer(routeAction.output)} converter - Remotion Convert`;
	}

	throw new Error('Invalid route action');
};

export const getDescription = (routeAction: RouteAction) => {
	if (routeAction.type === 'generic-convert') {
		return 'The fastest online video converter, powered by WebCodecs. No upload required, no watermarks, no limits.';
	}

	if (routeAction.type === 'convert') {
		return `The fastest online ${renderHumanReadableContainer(routeAction.input)} to ${renderHumanReadableContainer(routeAction.output)} converter, powered by WebCodecs. No upload required, no watermarks, no limits.`;
	}

	throw new Error('Invalid route action');
};
