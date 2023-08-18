import type {x264Preset} from '@remotion/renderer';

export const labelx264Preset = (profile: x264Preset) => {
	if (profile === 'ultrafast') {
		return 'ultrafast';
	}

	if (profile === 'superfast') {
		return 'superfast';
	}

	if (profile === 'veryfast') {
		return 'veryfast';
	}

	if (profile === 'faster') {
		return 'faster';
	}

	if (profile === 'fast') {
		return 'fast';
	}

	if (profile === 'medium') {
		return 'medium';
	}

	if (profile === 'slow') {
		return 'slow';
	}

	if (profile === 'slower') {
		return 'slower';
	}

	if (profile === 'veryslow') {
		return 'veryslow';
	}

	if (profile === 'placebo') {
		return 'placebo';
	}

	throw new TypeError(`Unknown Presets profile: ${profile}`);
};
