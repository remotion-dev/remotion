import type {
	BrowserExecutable,
	ChromiumOptions,
	HeadlessBrowser,
	LogLevel,
	RemotionServer,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {AnyCompMetadata} from 'remotion';
import {Log} from './log';
import {showSingleCompositionsPicker} from './show-compositions-picker';
import {formatBytes} from './format-bytes';

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
	logLevel,
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
	logLevel: LogLevel;
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
		const {metadata: config, propsSize} =
			await RenderInternals.internalSelectComposition({
				id: compName,
				inputProps,
				puppeteerInstance,
				envVariables,
				timeoutInMilliseconds,
				serveUrl: serveUrlOrWebpackUrl,
				browserExecutable,
				chromiumOptions,
				port,
				logLevel,
				server,
				indent,
				onBrowserLog: null,
			});

		if (propsSize > 10_000_000) {
			Log.warn(
				`The props of your composition are large (${formatBytes(
					propsSize
				)}). This may cause slowdown.`
			);
		}

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
			logLevel,
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
