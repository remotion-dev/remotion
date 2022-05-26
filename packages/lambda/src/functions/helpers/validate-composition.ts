import {
	ChromiumOptions,
	getCompositions,
	openBrowser,
} from '@remotion/renderer';
import {FfmpegExecutable, TCompMetadata} from 'remotion';
import {Await} from '../../shared/await';

type ValidateCompositionOptions = {
	serveUrl: string;
	composition: string;
	browserInstance: Await<ReturnType<typeof openBrowser>>;
	inputProps: unknown;
	envVariables: Record<string, string> | undefined;
	ffmpegExecutable: FfmpegExecutable;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
};

export const validateComposition = async ({
	serveUrl,
	composition,
	browserInstance,
	inputProps,
	envVariables,
	timeoutInMilliseconds,
	ffmpegExecutable,
	chromiumOptions,
}: ValidateCompositionOptions): Promise<TCompMetadata> => {
	const compositions = await getCompositions(serveUrl, {
		puppeteerInstance: browserInstance,
		inputProps: inputProps as object,
		envVariables,
		ffmpegExecutable,
		timeoutInMilliseconds,
		chromiumOptions,
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
