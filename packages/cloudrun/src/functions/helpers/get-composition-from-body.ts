import {getCompositions} from '@remotion/renderer';

export const getCompositionFromBody = async (
	serveUrl: string,
	compositionName: string
) => {
	const comps = await getCompositions(serveUrl);
	const composition = comps.find((comp) => comp.id === compositionName);

	if (composition) {
		return composition;
	}

	throw new Error(`Composition not found: ${compositionName}`);
};
