import type {
	BrowserExecutable,
	ChromiumOptions,
	DownloadMap,
	HeadlessBrowser,
} from '@remotion/renderer';
import type {AnyCompMetadata} from 'remotion';
import {getCompositionId} from './get-composition-id';

export const getCompositionWithDimensionOverride = async ({
	height,
	width,
	args,
	compositionIdFromUi,
	chromiumOptions,
	envVariables,
	port,
	puppeteerInstance,
	timeoutInMilliseconds,
	browserExecutable,
	downloadMap,
	serveUrlOrWebpackUrl,
	indent,
	inputProps,
	verbose,
}: {
	height: number | null;
	width: number | null;
	args: string[];
	compositionIdFromUi: string | null;
	timeoutInMilliseconds: number;
	puppeteerInstance: HeadlessBrowser | undefined;
	envVariables: Record<string, string>;
	chromiumOptions: ChromiumOptions;
	port: number | null;
	browserExecutable: BrowserExecutable | null;
	downloadMap: DownloadMap | undefined;
	serveUrlOrWebpackUrl: string;
	indent: boolean;
	verbose: boolean;
	inputProps: object | null;
}): Promise<{
	compositionId: string;
	reason: string;
	config: AnyCompMetadata;
	argsAfterComposition: string[];
}> => {
	const returnValue = await getCompositionId({
		args,
		compositionIdFromUi,
		indent,
		serveUrlOrWebpackUrl,
		verbose,
		browserExecutable,
		chromiumOptions,
		downloadMap,
		envVariables,
		inputProps,
		port,
		puppeteerInstance,
		timeoutInMilliseconds,
	});

	return {
		...returnValue,
		config: {
			...returnValue.config,
			height: height ?? returnValue.config.height,
			width: width ?? returnValue.config.width,
		},
	};
};
