import {getCompositions, RenderInternals} from '@remotion/renderer';
import {TCompMetadata} from 'remotion';

// TODO: redundant
type Await<T> = T extends PromiseLike<infer U> ? U : T;

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
	// TODO: Support input props
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
