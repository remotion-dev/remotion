import {convertEntryPointToServeUrl} from './convert-entry-point-to-serve-url';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {Log} from './log';
import {parsedCli} from './parse-command-line';
import {renderStillFlow} from './render-flows/still';

export const still = async (remotionRoot: string, args: string[]) => {
	const {
		file,
		remainingArgs,
		reason: entryPointReason,
	} = findEntryPoint(args, remotionRoot);

	if (!file) {
		Log.error('No entry point specified. Pass more arguments:');
		Log.error(
			'   npx remotion render [entry-point] [composition-name] [out-name]'
		);
		Log.error('Documentation: https://www.remotion.dev/docs/render');
		process.exit(1);
	}

	const fullEntryPoint = convertEntryPointToServeUrl(file);

	if (parsedCli.frames) {
		Log.error(
			'--frames flag was passed to the `still` command. This flag only works with the `render` command. Did you mean `--frame`? See reference: https://www.remotion.dev/docs/cli/'
		);
		process.exit(1);
	}

	const {
		browser,
		browserExecutable,
		chromiumOptions,
		envVariables,
		height,
		inputProps,
		overwrite,
		port,
		publicDir,
		puppeteerTimeout,
		quality,
		scale,
		stillFrame,
		width,
		logLevel,
	} = await getCliOptions({
		isLambda: false,
		type: 'still',
		remotionRoot,
	});

	const jobCleanups: (() => void)[] = [];

	try {
		await renderStillFlow({
			remotionRoot,
			entryPointReason,
			fullEntryPoint,
			remainingArgs,
			browser,
			browserExecutable,
			chromiumOptions,
			envVariables,
			height,
			inputProps,
			overwrite,
			port,
			publicDir,
			puppeteerTimeout,
			quality,
			scale,
			stillFrame,
			width,
			compositionIdFromUi: null,
			imageFormatFromUi: null,
			logLevel,
			onProgress: () => undefined,
			indentOutput: false,
			addCleanupCallback: (c) => {
				jobCleanups.push(c);
			},
			cancelSignal: null,
		});
	} finally {
		// TODO: Check whether all temp files are cleaned up
		// after this change
		await Promise.all(jobCleanups.map((c) => c()));
	}
};
