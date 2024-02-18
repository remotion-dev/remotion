import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactInternals} from 'remotion/no-react';
import {registerCleanupJob} from './cleanup-before-quit';
import {getRendererPortFromConfigFileAndCliFlag} from './config/preview-server';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {Log} from './log';
import {parsedCli, quietFlagProvided} from './parse-command-line';
import {printCompositions} from './print-compositions';
import {bundleOnCliOrTakeServeUrl} from './setup-cache';

const {
	enableMultiprocessOnLinuxOption,
	offthreadVideoCacheSizeInBytesOption,
	glOption,
	headlessOption,
	delayRenderTimeoutInMillisecondsOption,
} = BrowserSafeApis.options;

export const listCompositionsCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	const {file, reason} = findEntryPoint(args, remotionRoot, logLevel);

	if (!file) {
		Log.error(
			{indent: false, logLevel},
			'The `compositions` command requires you to specify a entry point. For example',
		);
		Log.error(
			{indent: false, logLevel},
			'  npx remotion compositions src/index.ts',
		);
		Log.error(
			{indent: false, logLevel},
			'See https://www.remotion.dev/docs/register-root for more information.',
		);
		process.exit(1);
	}

	Log.verbose(
		{indent: false, logLevel},
		'Entry point:',
		file,
		'reason:',
		reason,
	);

	const {
		browserExecutable,
		envVariables,
		inputProps,
		publicDir,
		ignoreCertificateErrors,
		userAgent,
		disableWebSecurity,
	} = getCliOptions({
		isLambda: false,
		isStill: false,
		logLevel,
	});

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity,
		enableMultiProcessOnLinux: enableMultiprocessOnLinuxOption.getValue({
			commandLine: parsedCli,
		}).value,
		gl: glOption.getValue({commandLine: parsedCli}).value,
		headless: headlessOption.getValue({commandLine: parsedCli}).value,
		ignoreCertificateErrors,
		userAgent,
	};

	const {urlOrBundle: bundled, cleanup: cleanupBundle} =
		await bundleOnCliOrTakeServeUrl({
			remotionRoot,
			fullPath: file,
			publicDir,
			onProgress: () => undefined,
			indentOutput: false,
			logLevel,
			bundlingStep: 0,
			steps: 1,
			onDirectoryCreated: (dir) => {
				registerCleanupJob(() => RenderInternals.deleteDirectory(dir));
			},
			quietProgress: false,
			quietFlag: quietFlagProvided(),
			outDir: null,
			// Not needed for compositions
			gitSource: null,
			bufferStateDelayInMilliseconds: null,
			maxTimlineTracks: null,
		});

	registerCleanupJob(() => cleanupBundle());

	const compositions = await RenderInternals.internalGetCompositions({
		serveUrlOrWebpackUrl: bundled,
		browserExecutable,
		chromiumOptions,
		envVariables,
		serializedInputPropsWithCustomSchema:
			NoReactInternals.serializeJSONWithDate({
				data: inputProps,
				staticBase: null,
				indent: undefined,
			}).serializedString,
		timeoutInMilliseconds: delayRenderTimeoutInMillisecondsOption.getValue({
			commandLine: parsedCli,
		}).value,
		port: getRendererPortFromConfigFileAndCliFlag(),
		indent: false,
		onBrowserLog: null,
		puppeteerInstance: undefined,
		logLevel,
		server: undefined,
		offthreadVideoCacheSizeInBytes:
			offthreadVideoCacheSizeInBytesOption.getValue({
				commandLine: parsedCli,
			}).value,
	});

	printCompositions(compositions, logLevel);
};
