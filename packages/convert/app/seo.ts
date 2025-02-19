import type {MediaParserContainer} from '@remotion/media-parser';
import type {ConvertMediaContainer} from '@remotion/webcodecs';
import {getAvailableContainers} from '@remotion/webcodecs';
import {renderHumanReadableContainer} from './lib/render-codec-label';

export const inputContainers: MediaParserContainer[] = ['mp4', 'webm', 'avi'];
export const outputContainers = getAvailableContainers();

export const parseConvertRouteAction = (action: string) => {
	const split = action.split('-to-');
	if (split.length !== 2) {
		throw new Error('Invalid action: ' + action);
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
			input: ConvertMediaContainer | MediaParserContainer;
			output: ConvertMediaContainer;
	  }
	| {
			type: 'generic-convert';
	  }
	| {
			type: 'generic-rotate';
	  }
	| {
			type: 'rotate-format';
			format: MediaParserContainer | ConvertMediaContainer;
	  }
	| {
			type: 'generic-mirror';
	  }
	| {
			type: 'mirror-format';
			format: MediaParserContainer | ConvertMediaContainer;
	  }
	| {
			type: 'generic-resize';
	  }
	| {
			type: 'report';
	  }
	| {
			type: 'resize-format';
			format: MediaParserContainer | ConvertMediaContainer;
	  }
	| {
			type: 'generic-probe';
	  };

export const getHeaderTitle = (routeAction: RouteAction) => {
	if (routeAction.type === 'convert') {
		return `Fast ${renderHumanReadableContainer(routeAction.input)} → ${renderHumanReadableContainer(routeAction.output)} conversion in the browser`;
	}

	if (routeAction.type === 'generic-probe') {
		return 'See video metadata in the browser';
	}

	if (routeAction.type === 'generic-convert') {
		return 'Fast video conversion in the browser';
	}

	if (routeAction.type === 'generic-rotate') {
		return 'Fast video rotation in the browser';
	}

	if (routeAction.type === 'rotate-format') {
		return `Fast ${renderHumanReadableContainer(routeAction.format)} rotation in the browser`;
	}

	if (routeAction.type === 'generic-mirror') {
		return 'Fast video mirroring in the browser';
	}

	if (routeAction.type === 'mirror-format') {
		return `Fast ${renderHumanReadableContainer(routeAction.format)} mirroring in the browser`;
	}

	if (routeAction.type === 'generic-resize') {
		return 'Fast video resizing in the browser';
	}

	if (routeAction.type === 'resize-format') {
		return `Fast ${renderHumanReadableContainer(routeAction.format)} resizing in the browser`;
	}

	if (routeAction.type === 'report') {
		return `Report bad videos to Remotion`;
	}

	throw new Error(`Invalid route action ${routeAction satisfies never}`);
};

export const getPageTitle = (routeAction: RouteAction) => {
	if (routeAction.type === 'generic-convert') {
		return 'Remotion Convert - Fast video conversion in the browser';
	}

	if (routeAction.type === 'convert') {
		return `Online ${renderHumanReadableContainer(routeAction.input)} to ${renderHumanReadableContainer(routeAction.output)} converter - Remotion Convert`;
	}

	if (routeAction.type === 'generic-probe') {
		return 'Online Video Metadata Viewer - Remotion Convert';
	}

	if (routeAction.type === 'generic-rotate') {
		return 'Online Video Rotation - Remotion Convert';
	}

	if (routeAction.type === 'generic-mirror') {
		return 'Online Video Mirrorer - Remotion Convert';
	}

	if (routeAction.type === 'rotate-format') {
		return `Online ${renderHumanReadableContainer(routeAction.format)} Rotator - Remotion Convert`;
	}

	if (routeAction.type === 'mirror-format') {
		return `Online ${renderHumanReadableContainer(routeAction.format)} Mirrorer - Remotion Convert`;
	}

	if (routeAction.type === 'generic-resize') {
		return 'Online Video Resizer - Remotion Convert';
	}

	if (routeAction.type === 'resize-format') {
		return `Online ${renderHumanReadableContainer(routeAction.format)} Resizer - Remotion Convert`;
	}

	if (routeAction.type === 'report') {
		return `Report bad videos to Remotion`;
	}

	throw new Error(`Invalid route action ${routeAction satisfies never}`);
};

export const getDescription = (routeAction: RouteAction) => {
	if (routeAction.type === 'generic-convert') {
		return 'The fastest online video converter, powered by WebCodecs. No upload required, no watermarks, no limits.';
	}

	if (routeAction.type === 'convert') {
		return `The fastest online ${renderHumanReadableContainer(routeAction.input)} to ${renderHumanReadableContainer(routeAction.output)} converter, powered by WebCodecs. No upload required, no watermarks, no limits.`;
	}

	if (routeAction.type === 'generic-probe') {
		return `The fastest online video metadata viewer. No upload required, no ads, no limits.`;
	}

	if (routeAction.type === 'generic-rotate') {
		return `The fastest online video rotator, powered by WebCodecs. No upload required, no watermarks, no limits.`;
	}

	if (routeAction.type === 'generic-mirror') {
		return `The fastest online video mirrorer, powered by WebCodecs. No upload required, no watermarks, no limits.`;
	}

	if (routeAction.type === 'rotate-format') {
		return `The fastest online ${renderHumanReadableContainer(
			routeAction.format,
		)} rotator, powered by WebCodecs. No upload required, no watermarks, no limits.`;
	}

	if (routeAction.type === 'mirror-format') {
		return `The fastest online ${renderHumanReadableContainer(
			routeAction.format,
		)} rotator, powered by WebCodecs. No upload required, no watermarks, no limits.`;
	}

	if (routeAction.type === 'generic-resize') {
		return `The fastest online video resizer, powered by WebCodecs. No upload required, no watermarks, no limits.`;
	}

	if (routeAction.type === 'resize-format') {
		return `The fastest online ${renderHumanReadableContainer(
			routeAction.format,
		)} resizer, powered by WebCodecs. No upload required, no watermarks, no limits.`;
	}

	if (routeAction.type === 'report') {
		return `Report bad videos to Remotion. We will investigate and fix them.`;
	}

	throw new Error(`Invalid route action ${routeAction satisfies never}`);
};

export const makeSlug = (routeAction: RouteAction) => {
	if (routeAction.type === 'convert') {
		return `/convert/${routeAction.input}-to-${routeAction.output}`;
	}

	if (routeAction.type === 'generic-convert') {
		return '/convert';
	}

	if (routeAction.type === 'generic-probe') {
		return '/probe';
	}

	if (routeAction.type === 'generic-rotate') {
		return '/rotate';
	}

	if (routeAction.type === 'rotate-format') {
		return `/rotate/${routeAction.format}`;
	}

	if (routeAction.type === 'mirror-format') {
		return `/mirror/${routeAction.format}`;
	}

	if (routeAction.type === 'generic-mirror') {
		return `/mirror`;
	}

	if (routeAction.type === 'generic-resize') {
		return '/resize';
	}

	if (routeAction.type === 'report') {
		return '/report';
	}

	if (routeAction.type === 'resize-format') {
		return `/resize/${routeAction.format}`;
	}

	throw new Error(`Invalid route action ${routeAction satisfies never}`);
};
