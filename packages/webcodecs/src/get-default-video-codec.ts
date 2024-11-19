import type {ConvertMediaContainer, ConvertMediaVideoCodec} from './codec-id';

export const getDefaultVideoCodec = ({
	container,
}: {
	container: ConvertMediaContainer;
}): ConvertMediaVideoCodec => {
	if (container === 'webm') {
		return 'vp8';
	}

	throw new Error(`Unhandled container: ${container} satisfies never`);
};
