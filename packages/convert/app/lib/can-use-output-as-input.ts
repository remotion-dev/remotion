import type {ConvertMediaContainer} from '@remotion/webcodecs';

export const canUseOutputAsInput = (container: ConvertMediaContainer) => {
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
