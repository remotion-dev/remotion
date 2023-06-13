import type {
	BrowserExecutable,
	ChromiumOptions,
	HeadlessBrowser,
	RemotionServer,
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
	serveUrlOrWebpackUrl,
	indent,
	inputProps,
	verbose,
	server,
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
	serveUrlOrWebpackUrl: string;
	indent: boolean;
	verbose: boolean;
	inputProps: Record<string, unknown>;
	server: RemotionServer;
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
		envVariables,
		inputProps,
		port,
		puppeteerInstance,
		timeoutInMilliseconds,
		server,
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
