import type {ConvertMediaVideoCodec} from './codec-id';
import type {ConvertMediaContainer} from './convert-media';

export const getDefaultVideoCodec = (
	container: ConvertMediaContainer,
): ConvertMediaVideoCodec => {
	if (container === 'webm') {
		return 'vp8';
	}

	throw new Error(`Unhandled codec: ${container} satisfies never`);
};
