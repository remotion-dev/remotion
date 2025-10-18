import type {OutputContainer} from '~/seo';

export const canUseOutputAsInput = (container: OutputContainer) => {
	if (container === 'wav') {
		return true;
	}

	if (container === 'mp4') {
		return true;
	}

	if (container === 'webm') {
		return true;
	}

	throw new Error(`Unsupported container: ${container satisfies never}`);
};
