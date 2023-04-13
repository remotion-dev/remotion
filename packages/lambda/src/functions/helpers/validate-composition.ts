import type {
	ChromiumOptions,
	DownloadMap,
	openBrowser,
} from '@remotion/renderer';
import {getCompositions} from '@remotion/renderer';
import type {AnyCompMetadata} from 'remotion';
import type {Await} from '../../shared/await';
import {executablePath} from './get-chromium-executable-path';

type ValidateCompositionOptions = {
	serveUrl: string;
	composition: string;
	browserInstance: Await<ReturnType<typeof openBrowser>>;
	inputProps: unknown;
	envVariables: Record<string, string> | undefined;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	port: number | null;
	downloadMap: DownloadMap;
	forceHeight: number | null;
	forceWidth: number | null;
};

export const validateComposition = async ({
	serveUrl,
	composition,
	browserInstance,
	inputProps,
	envVariables,
	timeoutInMilliseconds,
	chromiumOptions,
	port,
	downloadMap,
	forceHeight,
	forceWidth,
}: ValidateCompositionOptions): Promise<AnyCompMetadata> => {
	const compositions = await getCompositions(serveUrl, {
		puppeteerInstance: browserInstance,
		inputProps: inputProps as object,
		envVariables,
		timeoutInMilliseconds,
		chromiumOptions,
		port,
		downloadMap,
		browserExecutable: executablePath(),
	});

	const found = compositions.find((c) => c.id === composition);
	if (!found) {
		throw new Error(
			`No composition with ID ${composition} found. Available compositions: ${compositions
				.map((c) => c.id)
				.join(', ')}`
		);
	}

	return {
		...found,
		height: forceHeight ?? found.height,
		width: forceWidth ?? found.width,
	};
};
