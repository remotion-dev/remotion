import {renderHumanReadableContainer} from './lib/render-codec-label';

export const inputContainers = ['mp4', 'webm', 'mov', 'mkv'] as const;
export const outputContainers = [
	'mp4',
	'webm',
	'mov',
	'wav',
	'mkv',
	'aac',
	'mp3',
] as const;

export type InputContainer = (typeof inputContainers)[number];
export type OutputContainer = (typeof outputContainers)[number];

export const parseConvertRouteAction = (action: string) => {
	const split = action.split('-to-');
	if (split.length !== 2) {
		throw new Error('Invalid action: ' + action);
	}

	if (split[0] === split[1]) {
		throw new Error('Input and output container cannot be the same');
	}

	return {
		input: split[0] as InputContainer,
		output: split[1] as OutputContainer,
	};
};

export type RouteAction =
	| {
			type: 'convert';
			input: InputContainer;
			output: OutputContainer;
	  }
	| {
			type: 'generic-convert';
	  }
	| {
			type: 'generic-rotate';
	  }
	| {
			type: 'rotate-format';
			format: InputContainer;
	  }
	| {
			type: 'generic-mirror';
	  }
	| {
			type: 'mirror-format';
			format: InputContainer;
	  }
	| {
			type: 'generic-crop';
	  }
	| {
			type: 'crop-format';
			format: InputContainer;
	  }
	| {
			type: 'generic-resize';
	  }
	| {
			type: 'report';
	  }
	| {
			type: 'resize-format';
			format: OutputContainer;
	  }
	| {
			type: 'generic-probe';
	  }
	| {
			type: 'transcribe';
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

	if (routeAction.type === 'transcribe') {
		return 'Fast video and audio transcription in the browser';
	}

	if (routeAction.type === 'generic-crop') {
		return 'Fast video cropping in the browser';
	}

	if (routeAction.type === 'crop-format') {
		return `Fast ${renderHumanReadableContainer(routeAction.format)} cropping in the browser`;
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

	if (routeAction.type === 'transcribe') {
		return `Online Audio and Video Transcriber - Remotion Convert`;
	}

	if (routeAction.type === 'generic-crop') {
		return 'Online Video Cropper - Remotion Convert';
	}

	if (routeAction.type === 'crop-format') {
		return `Online ${renderHumanReadableContainer(routeAction.format)} Cropper - Remotion Convert`;
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

	if (routeAction.type === 'transcribe') {
		return `A free and local online audio and video transcriber, powered by Whisper. No upload required, no watermarks, no limits.`;
	}

	if (routeAction.type === 'generic-crop') {
		return `The fastest online video cropper, powered by WebCodecs. No upload required, no watermarks, no limits.`;
	}

	if (routeAction.type === 'crop-format') {
		return `The fastest online ${renderHumanReadableContainer(routeAction.format)} cropper, powered by WebCodecs. No upload required, no watermarks, no limits.`;
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

	if (routeAction.type === 'transcribe') {
		return '/transcribe';
	}

	if (routeAction.type === 'generic-crop') {
		return '/crop';
	}

	if (routeAction.type === 'crop-format') {
		return `/crop/${routeAction.format}`;
	}

	throw new Error(`Invalid route action ${routeAction satisfies never}`);
};
