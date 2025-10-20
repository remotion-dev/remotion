import type {RouteAction} from '~/seo';

export type RotateOrMirrorState = 'rotate' | 'mirror' | null;

export const defaultRotateOrMirorState = (
	action: RouteAction,
): RotateOrMirrorState => {
	if (action.type === 'convert') {
		return null;
	}

	if (action.type === 'generic-probe') {
		return null;
	}

	if (action.type === 'generic-convert') {
		return null;
	}

	if (action.type === 'generic-rotate') {
		return 'rotate';
	}

	if (action.type === 'rotate-format') {
		return 'rotate';
	}

	if (action.type === 'mirror-format') {
		return 'mirror';
	}

	if (action.type === 'generic-mirror') {
		return 'mirror';
	}

	if (action.type === 'generic-resize') {
		return null;
	}

	if (action.type === 'resize-format') {
		return null;
	}

	if (action.type === 'report') {
		return null;
	}

	if (action.type === 'transcribe') {
		return null;
	}

	throw new Error(
		'Rotate is not enabled by default ' + (action satisfies never),
	);
};

export const isConvertEnabledByDefault = (action: RouteAction) => {
	if (action.type === 'convert') {
		return true;
	}

	if (action.type === 'generic-probe') {
		return true;
	}

	if (action.type === 'generic-convert') {
		return true;
	}

	if (action.type === 'generic-rotate') {
		return true;
	}

	if (action.type === 'rotate-format') {
		return true;
	}

	if (action.type === 'mirror-format') {
		return true;
	}

	if (action.type === 'generic-mirror') {
		return true;
	}

	if (action.type === 'generic-resize') {
		return true;
	}

	if (action.type === 'resize-format') {
		return true;
	}

	if (action.type === 'report') {
		return true;
	}

	if (action.type === 'transcribe') {
		return true;
	}

	throw new Error(
		'Convert is not enabled by default ' + (action satisfies never),
	);
};

export type ConvertSections =
	| 'convert'
	| 'rotate'
	| 'mirror'
	| 'resize'
	| 'crop'
	| 'resample';

export const getOrderOfSections = (
	action: RouteAction,
): {[key in ConvertSections]: number} => {
	if (action.type === 'generic-rotate' || action.type === 'rotate-format') {
		return {
			rotate: 0,
			resize: 1,
			crop: 2,
			mirror: 3,
			convert: 4,
			resample: 5,
		};
	}

	if (action.type === 'convert' || action.type === 'generic-convert') {
		return {
			convert: 0,
			crop: 1,
			resize: 2,
			rotate: 3,
			mirror: 4,
			resample: 5,
		};
	}

	if (action.type === 'generic-probe') {
		return {
			convert: 0,
			resize: 1,
			crop: 2,
			rotate: 3,
			mirror: 4,
			resample: 5,
		};
	}

	if (action.type === 'generic-mirror' || action.type === 'mirror-format') {
		return {
			mirror: 0,
			resize: 1,
			crop: 2,
			rotate: 3,
			convert: 4,
			resample: 5,
		};
	}

	if (
		action.type === 'generic-resize' ||
		action.type === 'resize-format' ||
		action.type === 'report' ||
		action.type === 'transcribe'
	) {
		return {
			resize: 0,
			rotate: 1,
			crop: 2,
			mirror: 3,
			convert: 4,
			resample: 5,
		};
	}

	throw new Error(action satisfies never);
};
