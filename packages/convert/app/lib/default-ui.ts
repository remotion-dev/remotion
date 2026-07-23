import type {RouteAction} from '~/seo';

export type RotateOrMirrorOrCropState = 'rotate' | 'mirror' | 'crop' | null;

export const defaultRotateOrMirorState = (
	action: RouteAction,
): RotateOrMirrorOrCropState => {
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

	if (action.type === 'generic-crop') {
		return 'crop';
	}

	if (action.type === 'crop-format') {
		return 'crop';
	}

	if (action.type === 'generic-trim') {
		return null;
	}

	if (action.type === 'trim-format') {
		return null;
	}

	if (action.type === 'timing-editor') {
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
		return false;
	}

	if (action.type === 'generic-convert') {
		return true;
	}

	if (action.type === 'generic-rotate') {
		return false;
	}

	if (action.type === 'rotate-format') {
		return false;
	}

	if (action.type === 'mirror-format') {
		return false;
	}

	if (action.type === 'generic-mirror') {
		return false;
	}

	if (action.type === 'generic-resize') {
		return false;
	}

	if (action.type === 'resize-format') {
		return false;
	}

	if (action.type === 'report') {
		return false;
	}

	if (action.type === 'transcribe') {
		return false;
	}

	if (action.type === 'generic-crop') {
		return false;
	}

	if (action.type === 'crop-format') {
		return false;
	}

	if (action.type === 'generic-trim') {
		return false;
	}

	if (action.type === 'trim-format') {
		return false;
	}

	if (action.type === 'timing-editor') {
		return false;
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
	| 'trim'
	| 'resample';

export const isVideoOnlySection = (section: ConvertSections): boolean => {
	if (
		section === 'rotate' ||
		section === 'mirror' ||
		section === 'resize' ||
		section === 'crop' ||
		section === 'trim'
	) {
		return true;
	}

	if (section === 'convert' || section === 'resample') {
		return false;
	}

	throw new Error(section satisfies never);
};

export const getOrderOfSections = (
	action: RouteAction,
): {[key in ConvertSections]: number} => {
	if (action.type === 'generic-crop' || action.type === 'crop-format') {
		return {
			crop: 0,
			resize: 1,
			rotate: 2,
			mirror: 3,
			trim: 4,
			convert: 5,
			resample: 6,
		};
	}

	if (action.type === 'generic-trim' || action.type === 'trim-format') {
		return {
			trim: 0,
			crop: 1,
			resize: 2,
			rotate: 3,
			mirror: 4,
			convert: 5,
			resample: 6,
		};
	}

	if (action.type === 'generic-rotate' || action.type === 'rotate-format') {
		return {
			rotate: 0,
			resize: 1,
			crop: 2,
			mirror: 3,
			trim: 4,
			convert: 5,
			resample: 6,
		};
	}

	if (action.type === 'convert' || action.type === 'generic-convert') {
		return {
			convert: 0,
			crop: 1,
			resize: 2,
			rotate: 3,
			mirror: 4,
			trim: 5,
			resample: 6,
		};
	}

	if (action.type === 'generic-probe') {
		return {
			convert: 0,
			resize: 1,
			crop: 2,
			rotate: 3,
			mirror: 4,
			trim: 5,
			resample: 6,
		};
	}

	if (action.type === 'generic-mirror' || action.type === 'mirror-format') {
		return {
			mirror: 0,
			resize: 1,
			crop: 2,
			rotate: 3,
			trim: 4,
			convert: 5,
			resample: 6,
		};
	}

	if (
		action.type === 'generic-resize' ||
		action.type === 'resize-format' ||
		action.type === 'report' ||
		action.type === 'transcribe' ||
		action.type === 'timing-editor'
	) {
		return {
			resize: 0,
			rotate: 1,
			crop: 2,
			mirror: 3,
			trim: 4,
			convert: 5,
			resample: 6,
		};
	}

	throw new Error(action satisfies never);
};
