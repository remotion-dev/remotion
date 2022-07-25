import type {
	ChromiumOptions,
	FfmpegExecutable,
	openBrowser,
} from '@remotion/renderer';
import {getCompositions} from '@remotion/renderer';
import type {TCompMetadata} from 'remotion';
import type {Await} from '../../shared/await';

type ValidateCompositionOptions = {
	serveUrl: string;
	composition: string;
	browserInstance: Await<ReturnType<typeof openBrowser>>;
	inputProps: unknown;
	envVariables: Record<string, string> | undefined;
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	port: number | null;
};

export const validateComposition = async ({
	serveUrl,
	composition,
	browserInstance,
	inputProps,
	envVariables,
	timeoutInMilliseconds,
	ffmpegExecutable,
	ffprobeExecutable,
	chromiumOptions,
	port,
}: ValidateCompositionOptions): Promise<TCompMetadata> => {
	const compositions = await getCompositions(serveUrl, {
		puppeteerInstance: browserInstance,
		inputProps: inputProps as object,
		envVariables,
		ffmpegExecutable,
		ffprobeExecutable,
		timeoutInMilliseconds,
		chromiumOptions,
		port,
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
