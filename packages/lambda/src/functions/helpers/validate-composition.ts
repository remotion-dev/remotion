import {getCompositions, RenderInternals} from '@remotion/renderer';
import {TCompMetadata} from 'remotion';
import {Await} from '../../shared/await';

export const validateComposition = async ({
	serveUrl,
	composition,
	browserInstance,
	inputProps,
}: {
	serveUrl: string;
	composition: string;
	browserInstance: Await<ReturnType<typeof RenderInternals.openBrowser>>;
	inputProps: unknown;
}): Promise<TCompMetadata> => {
	const compositions = await getCompositions(serveUrl, {
		browserInstance,
		inputProps: inputProps as object,
	});
	const found = compositions.find((c) => c.id === composition);
	if (!found) {
		throw new Error(
			`No composition with ID ${composition} found. Available compositions: ${compositions
				.map((c) => c.id)
				.join(', ')}`
		);
	}

	return found;
};
