import type {
	ChromiumOptions,
	DownloadMap,
	LogLevel,
	openBrowser,
} from '@remotion/renderer';
import {RenderInternals, selectComposition} from '@remotion/renderer';
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
	logLevel: LogLevel;
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
	logLevel,
}: ValidateCompositionOptions): Promise<AnyCompMetadata> => {
	const comp = await selectComposition({
		id: composition,
		puppeteerInstance: browserInstance,
		inputProps: inputProps as object,
		envVariables,
		timeoutInMilliseconds,
		chromiumOptions,
		port,
		downloadMap,
		browserExecutable: executablePath(),
		serveUrl,
		verbose: RenderInternals.isEqualOrBelowLogLevel(logLevel, 'verbose'),
	});

	return {
		...comp,
		height: forceHeight ?? comp.height,
		width: forceWidth ?? comp.width,
	};
};
