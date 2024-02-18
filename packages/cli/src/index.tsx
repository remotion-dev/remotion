import {RenderInternals} from '@remotion/renderer';
import minimist from 'minimist';
import {benchmarkCommand} from './benchmark';
import {bundleCommand} from './bundle';
import {chalk} from './chalk';
import {cleanupBeforeQuit, handleCtrlC} from './cleanup-before-quit';
import {cloudrunCommand} from './cloudrun-command';
import {listCompositionsCommand} from './compositions';
import {determineFinalStillImageFormat} from './determine-image-format';
import {getFileSizeDownloadBar} from './download-progress';
import {findEntryPoint} from './entry-point';
import {ffmpegCommand, ffprobeCommand} from './ffmpeg';
import {getCliOptions} from './get-cli-options';
import {getCompositionWithDimensionOverride} from './get-composition-with-dimension-override';
import {loadConfig} from './get-config-file-name';
import {gpuCommand} from './gpu';
import {getVideoImageFormat} from './image-formats';
import {initializeCli} from './initialize-cli';
import {lambdaCommand} from './lambda-command';
import {listOfRemotionPackages} from './list-of-remotion-packages';
import {Log} from './log';
import {makeProgressBar} from './make-progress-bar';
import {BooleanFlags, parsedCli, quietFlagProvided} from './parse-command-line';
import {printCompositions} from './print-compositions';
import {printError} from './print-error';
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
		await validateVersionsBeforeCommand(remotionRoot, 'info');
	}

	const isBun = typeof Bun !== 'undefined';
	if (isBun) {
		const version = Bun.version.split('.');
		if (version.length === 3) {
			if (Number(version[0]) < 1) {
				throw new Error('Please upgrade to at least Bun 1.0.3');
			}

			if (Number(version[1]) === 0 && Number(version[2]) < 3) {
				throw new Error('Please upgrade to at least Bun 1.0.3');
			}
		}

		Log.info(
			'You are running Remotion with Bun, which is mostly supported. Visit https://remotion.dev/bun for more information.',
		);
	}

	const isStudio = command === 'studio' || command === 'preview';

	const errorSymbolicationLock = isStudio
		? 0
		: RenderInternals.registerErrorSymbolicationLock();

	const logLevel = await initializeCli(remotionRoot);
	handleCtrlC({indent: false, logLevel});

	try {
		if (command === 'bundle') {
			await bundleCommand(remotionRoot, args, logLevel);
		} else if (command === 'compositions') {
			await listCompositionsCommand(remotionRoot, args, logLevel);
		} else if (isStudio) {
			await studioCommand(remotionRoot, args, logLevel);
		} else if (command === 'lambda') {
			await lambdaCommand(remotionRoot, args, logLevel);
		} else if (command === 'cloudrun') {
			await cloudrunCommand(remotionRoot, args, logLevel);
		} else if (command === 'render') {
			await render(remotionRoot, args, logLevel);
		} else if (command === 'still') {
			await still(remotionRoot, args, logLevel);
		} else if (command === 'ffmpeg') {
			ffmpegCommand(remotionRoot, process.argv.slice(3), logLevel);
		} else if (command === 'gpu') {
			await gpuCommand(remotionRoot, logLevel);
		} else if (command === 'ffprobe') {
			ffprobeCommand(remotionRoot, process.argv.slice(3), logLevel);
		} else if (command === 'upgrade') {
			await upgrade(
				remotionRoot,
				parsedCli['package-manager'],
				parsedCli.version,
			);
		} else if (command === VERSIONS_COMMAND) {
			await versionsCommand(remotionRoot, logLevel);
		} else if (command === 'benchmark') {
			await benchmarkCommand(remotionRoot, args, logLevel);
		} else if (command === 'help') {
			printHelp();
			process.exit(0);
		} else {
			if (command) {
				Log.errorAdvanced(
					{indent: false, logLevel},
					`Command ${command} not found.`,
				);
			}

			printHelp();
			process.exit(1);
		}
	} catch (err) {
		Log.info();
		await printError(err as Error, logLevel);
		cleanupBeforeQuit({indent: false, logLevel});
		process.exit(1);
	} finally {
		RenderInternals.unlockErrorSymbolicationLock(errorSymbolicationLock);
		cleanupBeforeQuit({indent: false, logLevel});
	}
};

import {StudioServerInternals} from '@remotion/studio-server';

export const CliInternals = {
	createOverwriteableCliOutput,
	chalk,
	makeProgressBar,
	Log,
	getCliOptions,
	loadConfig,
	formatBytes: StudioServerInternals.formatBytes,
	initializeCli,
	BooleanFlags,
	quietFlagProvided,
	parsedCli,
	printError,
	getFileSizeDownloadBar,
	determineFinalStillImageFormat,
	minimist,
	findEntryPoint,
	getVideoImageFormat,
	printCompositions,
	listOfRemotionPackages,
	shouldUseNonOverlayingLogger,
	getCompositionWithDimensionOverride,
};
