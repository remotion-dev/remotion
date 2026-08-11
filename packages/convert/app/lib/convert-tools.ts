import type {RouteAction} from '~/seo';

export type ConvertToolKey =
	| 'convert'
	| 'trim'
	| 'crop'
	| 'resize'
	| 'rotate'
	| 'mirror'
	| 'probe'
	| 'transcribe';

export const convertTools: {
	readonly key: ConvertToolKey;
	readonly label: string;
	readonly displayUrl: string;
	readonly href: string;
	readonly description: string;
}[] = [
	{
		key: 'convert',
		label: 'Convert',
		displayUrl: 'remotion.dev/convert',
		href: '/convert',
		description: 'Convert videos in the browser',
	},
	{
		key: 'trim',
		label: 'Trim',
		displayUrl: 'remotion.dev/trim',
		href: '/trim',
		description: 'Trim videos in the browser',
	},
	{
		key: 'crop',
		label: 'Crop',
		displayUrl: 'remotion.dev/crop',
		href: '/crop',
		description: 'Crop videos in the browser',
	},
	{
		key: 'resize',
		label: 'Resize',
		displayUrl: 'remotion.dev/resize',
		href: '/resize',
		description: 'Resize videos in the browser',
	},
	{
		key: 'rotate',
		label: 'Rotate',
		displayUrl: 'remotion.dev/rotate',
		href: '/rotate',
		description: 'Rotate videos in the browser',
	},
	{
		key: 'mirror',
		label: 'Mirror',
		displayUrl: 'remotion.dev/mirror',
		href: '/mirror',
		description: 'Mirror videos in the browser',
	},
	{
		key: 'probe',
		label: 'Probe',
		displayUrl: 'remotion.dev/probe',
		href: '/probe',
		description: 'Inspect video metadata in the browser',
	},
	{
		key: 'transcribe',
		label: 'Transcribe',
		displayUrl: 'remotion.dev/transcribe',
		href: '/transcribe',
		description: 'Transcribe audio and video in the browser',
	},
];

export const getActiveConvertTool = (
	routeAction: RouteAction,
): ConvertToolKey | null => {
	if (
		routeAction.type === 'convert' ||
		routeAction.type === 'generic-convert'
	) {
		return 'convert';
	}

	if (
		routeAction.type === 'generic-trim' ||
		routeAction.type === 'trim-format'
	) {
		return 'trim';
	}

	if (
		routeAction.type === 'generic-crop' ||
		routeAction.type === 'crop-format'
	) {
		return 'crop';
	}

	if (
		routeAction.type === 'generic-resize' ||
		routeAction.type === 'resize-format'
	) {
		return 'resize';
	}

	if (
		routeAction.type === 'generic-rotate' ||
		routeAction.type === 'rotate-format'
	) {
		return 'rotate';
	}

	if (
		routeAction.type === 'generic-mirror' ||
		routeAction.type === 'mirror-format'
	) {
		return 'mirror';
	}

	if (routeAction.type === 'generic-probe') {
		return 'probe';
	}

	if (routeAction.type === 'transcribe') {
		return 'transcribe';
	}

	if (routeAction.type === 'report' || routeAction.type === 'timing-editor') {
		return null;
	}

	throw new Error(`Invalid route action ${routeAction satisfies never}`);
};
