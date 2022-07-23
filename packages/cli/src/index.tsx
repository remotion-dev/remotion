import {RenderInternals} from '@remotion/renderer';
import {chalk} from './chalk';
import {checkNodeVersion} from './check-version';
import {listCompositionsCommand} from './compositions';
import {overrideRemotion} from './config/index';
import {getFileSizeDownloadBar} from './download-progress';
import {formatBytes} from './format-bytes';
import {getCliOptions} from './get-cli-options';
import {loadConfig} from './get-config-file-name';
import {handleCommonError} from './handle-common-errors';
import {initializeRenderCli} from './initialize-render-cli';
import {lambdaCommand} from './lambda-command';
import {loadConfigFile} from './load-config';
import {Log} from './log';
import {makeProgressBar} from './make-progress-bar';
import {
	BooleanFlags,
	parseCommandLine,
	parsedCli,
	quietFlagProvided,
} from './parse-command-line';
import {previewCommand} from './preview';
import {printHelp} from './print-help';
import {createOverwriteableCliOutput} from './progress-bar';
import {render} from './render';
import {still} from './still';
import {upgrade} from './upgrade';
import {
	validateVersionsBeforeCommand,
	versionsCommand,
	VERSIONS_COMMAND,
} from './versions';

export const cli = async () => {
	overrideRemotion();
	const args = process.argv;
	const command = args[2];

	if (parsedCli.help) {
		printHelp();
		process.exit(0);
	}

	// To check node version and to warn if node version is <12.10.0
	checkNodeVersion();
	if (command !== VERSIONS_COMMAND) {
		await validateVersionsBeforeCommand();
	}

	const errorSymbolicationLock =
		RenderInternals.registerErrorSymbolicationLock();

	try {
		if (command === 'compositions') {
			await listCompositionsCommand();
		} else if (command === 'preview') {
			await previewCommand();
		} else if (command === 'lambda') {
			await lambdaCommand();
		} else if (command === 'render') {
			await render();
		} else if (command === 'still') {
			await still();
		} else if (command === 'upgrade') {
			await upgrade();
		} else if (command === VERSIONS_COMMAND) {
			await versionsCommand();
		} else if (command === 'help') {
			printHelp();
			process.exit(0);
		} else {
			Log.error(`Command ${command} not found.`);
			printHelp();
			process.exit(1);
		}
	} catch (err) {
		Log.info();
		await handleCommonError(err as Error);
		process.exit(1);
	} finally {
		RenderInternals.unlockErrorSymbolicationLock(errorSymbolicationLock);
	}
};

export {Config, ConfigInternals, overrideRemotion} from './config/index';
export * from './render';

export const CliInternals = {
	createOverwriteableCliOutput,
	chalk,
	makeProgressBar,
	Log,
	loadConfigFile,
	getCliOptions,
	parseCommandLine,
	loadConfig,
	initializeRenderCli,
	BooleanFlags,
	quietFlagProvided,
	parsedCli,
	handleCommonError,
	formatBytes,
	getFileSizeDownloadBar,
};
