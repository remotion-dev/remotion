import {RouteAction} from '~/seo';

export type RotateOrMirrorState = 'rotate' | 'mirror' | null;

export const defaultRotateOrMirorState = (
	action: RouteAction,
): RotateOrMirrorState => {
	if (action.type === 'convert') {
		return null;
	}

	if (action.type === 'generic-convert') {
		return null;
	}

	if (action.type === 'generic-rotate') {
		return 'rotate';
	}

	throw new Error(
		'Rotate is not enabled by default ' + (action satisfies never),
	);
};

export const isConvertEnabledByDefault = (action: RouteAction) => {
	if (action.type === 'convert') {
		return true;
	}

	if (action.type === 'generic-convert') {
		return true;
	}

	if (action.type === 'generic-rotate') {
		return false;
	}

	throw new Error(
		'Convert is not enabled by default ' + (action satisfies never),
	);
};
