import {RenderInternals} from '@remotion/renderer';
import minimist from 'minimist';
import {benchmarkCommand} from './benchmark';
import {chalk} from './chalk';
import {cleanupBeforeQuit, handleCtrlC} from './cleanup-before-quit';
import {cloudrunCommand} from './cloudrun-command';
import {listCompositionsCommand} from './compositions';
import {ConfigInternals} from './config';
import {determineFinalStillImageFormat} from './determine-image-format';
import {getFileSizeDownloadBar} from './download-progress';
import {findEntryPoint} from './entry-point';
import {ffmpegCommand, ffprobeCommand} from './ffmpeg';
import {formatBytes} from './format-bytes';
import {getCliOptions} from './get-cli-options';
import {getCompositionWithDimensionOverride} from './get-composition-with-dimension-override';
import {loadConfig} from './get-config-file-name';
import {getFinalOutputCodec} from './get-final-output-codec';
import {handleCommonError} from './handle-common-errors';
import {getVideoImageFormat} from './image-formats';
import {initializeCli} from './initialize-cli';
import {lambdaCommand} from './lambda-command';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import {Log} from './log';
import {makeProgressBar} from './make-progress-bar';
import {BooleanFlags, parsedCli, quietFlagProvided} from './parse-command-line';
import {printCompositions} from './print-compositions';
import {printHelp} from './print-help';
import {createOverwriteableCliOutput} from './progress-bar';
import {render} from './render';
import {shouldUseNonOverlayingLogger} from './should-use-non-overlaying-logger';
import {still} from './still';
import {studioCommand} from './studio';
import {upgrade} from './upgrade';
import {
	validateVersionsBeforeCommand,
	versionsCommand,
	VERSIONS_COMMAND,
} from './versions';

export const cli = async () => {
	const [command, ...args] = parsedCli._;

	if (parsedCli.help) {
		printHelp();
		process.exit(0);
	}

	const remotionRoot = RenderInternals.findRemotionRoot();
	if (command !== VERSIONS_COMMAND) {
		await validateVersionsBeforeCommand(remotionRoot);
	}

	const errorSymbolicationLock =
		RenderInternals.registerErrorSymbolicationLock();

	handleCtrlC();

	await initializeCli(remotionRoot);

	try {
		if (command === 'compositions') {
			await listCompositionsCommand(remotionRoot, args);
		} else if (command === 'preview' || command === 'studio') {
			await studioCommand(remotionRoot, args);
		} else if (command === 'lambda') {
			await lambdaCommand(remotionRoot, args);
		} else if (command === 'cloudrun') {
			await cloudrunCommand(remotionRoot, args);
		} else if (command === 'render') {
			await render(remotionRoot, args);
		} else if (command === 'still') {
			await still(remotionRoot, args);
		} else if (command === 'ffmpeg') {
			ffmpegCommand(remotionRoot, process.argv.slice(3));
		} else if (command === 'ffprobe') {
			ffprobeCommand(remotionRoot, process.argv.slice(3));
		} else if (command === 'upgrade') {
			await upgrade(remotionRoot, parsedCli['package-manager']);
		} else if (command === VERSIONS_COMMAND) {
			await versionsCommand(remotionRoot);
		} else if (command === 'benchmark') {
			await benchmarkCommand(remotionRoot, args);
		} else if (command === 'help') {
			printHelp();
			process.exit(0);
		} else {
			if (command) {
				Log.error(`Command ${command} not found.`);
			}

			printHelp();
			process.exit(1);
		}
	} catch (err) {
		Log.info();
		await handleCommonError(
			err as Error,
			ConfigInternals.Logging.getLogLevel()
		);
		cleanupBeforeQuit();
		process.exit(1);
	} finally {
		RenderInternals.unlockErrorSymbolicationLock(errorSymbolicationLock);
		cleanupBeforeQuit();
	}
};

export * from './render';

export const CliInternals = {
	createOverwriteableCliOutput,
	chalk,
	makeProgressBar,
	Log,
	getCliOptions,
	loadConfig,
	initializeCli,
	BooleanFlags,
	quietFlagProvided,
	parsedCli,
	handleCommonError,
	formatBytes,
	getFileSizeDownloadBar,
	determineFinalStillImageFormat,
	minimist,
	findEntryPoint,
	getVideoImageFormat,
	printCompositions,
	getFinalOutputCodec,
	listOfRemotionPackages,
	shouldUseNonOverlayingLogger,
	getCompositionWithDimensionOverride,
};
