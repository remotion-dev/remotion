import type {
	BrowserExecutable,
	ChromiumOptions,
	HeadlessBrowser,
	RemotionServer,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {AnyCompMetadata} from 'remotion';
import {Log} from './log';
import {showSingleCompositionsPicker} from './show-compositions-picker';

const getCompName = ({
	cliArgs,
	compositionIdFromUi,
}: {
	cliArgs: string[];
	compositionIdFromUi: string | null;
}): {
	compName: string;
	remainingArgs: string[];
	reason: string;
} => {
	if (compositionIdFromUi) {
		return {
			compName: compositionIdFromUi,
			remainingArgs: [],
			reason: 'via UI',
		};
	}

	const [compName, ...remainingArgs] = cliArgs;

	return {compName, remainingArgs, reason: 'Passed as argument'};
};

export const getCompositionId = async ({
	args,
	compositionIdFromUi,
	inputProps,
	puppeteerInstance,
	envVariables,
	timeoutInMilliseconds,
	chromiumOptions,
	port,
	browserExecutable,
	serveUrlOrWebpackUrl,
	verbose,
	indent,
	server,
}: {
	args: string[];
	compositionIdFromUi: string | null;
	inputProps: Record<string, unknown>;
	puppeteerInstance: HeadlessBrowser | undefined;
	envVariables: Record<string, string>;
	timeoutInMilliseconds: number;
	chromiumOptions: ChromiumOptions;
	port: number | null;
	browserExecutable: BrowserExecutable;
	serveUrlOrWebpackUrl: string;
	verbose: boolean;
	indent: boolean;
	server: RemotionServer;
}): Promise<{
	compositionId: string;
	reason: string;
	config: AnyCompMetadata;
	argsAfterComposition: string[];
}> => {
	const {
		compName,
		remainingArgs,
		reason: compReason,
	} = getCompName({
		cliArgs: args,
		compositionIdFromUi,
	});
	if (compName) {
		const config = await RenderInternals.internalSelectComposition({
			id: compName,
			inputProps,
			puppeteerInstance,
			envVariables,
			timeoutInMilliseconds,
			serveUrl: serveUrlOrWebpackUrl,
			browserExecutable,
			chromiumOptions,
			port,
			verbose,
			server,
			indent,
			onBrowserLog: null,
		});

		if (!config) {
			throw new Error(`Cannot find composition with ID "${compName}"`);
		}

		return {
			compositionId: compName,
			reason: compReason,
			config,
			argsAfterComposition: remainingArgs,
		};
	}

	if (!process.env.CI) {
		const comps = await RenderInternals.internalGetCompositions({
			inputProps,
			puppeteerInstance,
			envVariables,
			timeoutInMilliseconds,
			chromiumOptions,
			port,
			browserExecutable,
			verbose,
			indent,
			server,
			serveUrlOrWebpackUrl,
			onBrowserLog: null,
		});
		const {compositionId, reason} = await showSingleCompositionsPicker(comps);
		if (compositionId && typeof compositionId === 'string') {
			return {
				compositionId,
				reason,
				config: comps.find((c) => c.id === compositionId) as AnyCompMetadata,
				argsAfterComposition: args,
			};
		}
	}

	Log.error('Composition ID not passed.');
	Log.error('Pass an extra argument <composition-id>.');
	process.exit(1);
};
