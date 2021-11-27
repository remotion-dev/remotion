import {getCompositions, openBrowser} from '@remotion/renderer';
import {TCompMetadata} from 'remotion';
import {Await} from '../../shared/await';

type ValidateCompositionOptions = {
	serveUrl: string;
	composition: string;
	browserInstance: Await<ReturnType<typeof openBrowser>>;
	inputProps: unknown;
};

export const validateComposition = async ({
	serveUrl,
	composition,
	browserInstance,
	inputProps,
}: ValidateCompositionOptions): Promise<TCompMetadata> => {
	const compositions = await getCompositions(serveUrl, {
		puppeteerInstance: browserInstance,
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
