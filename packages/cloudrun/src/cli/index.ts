import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {parsedCloudrunCli} from './args';
import {permissionsCommand, PERMISSIONS_COMMAND} from './commands/permissions';
import {regionsCommand, REGIONS_COMMAND} from './commands/regions';
import {renderCommand, RENDER_COMMAND} from './commands/render';
import {servicesCommand, SERVICES_COMMAND} from './commands/services';
import {sitesCommand, SITES_COMMAND} from './commands/sites';
import {stillCommand, STILL_COMMAND} from './commands/still';
import {printHelp} from './help';
import {quit} from './helpers/quit';
import {Log} from './log';

const matchCommand = (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	if (parsedCloudrunCli.help || args.length === 0 || args[0] === 'help') {
		printHelp(logLevel);
		quit(0);
	}

	if (args[0] === RENDER_COMMAND) {
		return renderCommand(args.slice(1), remotionRoot, logLevel);
	}

	if (args[0] === STILL_COMMAND) {
		return stillCommand(args.slice(1), remotionRoot, logLevel);
	}

	if (args[0] === SERVICES_COMMAND) {
		return servicesCommand(args.slice(1), logLevel);
	}

	if (args[0] === SITES_COMMAND) {
		return sitesCommand(args.slice(1), remotionRoot, logLevel);
	}

	if (args[0] === REGIONS_COMMAND) {
		return regionsCommand();
	}

	if (args[0] === PERMISSIONS_COMMAND) {
		return permissionsCommand(logLevel);
	}

	if (args[0] === 'deploy') {
		Log.info(`The "deploy" command does not exist.`);
		Log.info(`Did you mean "service deploy"?`);
	}

	Log.error({indent: false, logLevel}, `Command ${args[0]} not found.`);
	printHelp(logLevel);
	quit(1);
};

export const executeCommand = async (
	args: string[],
	remotionRoot: string,
	logLevel: LogLevel,
) => {
	try {
		await matchCommand(args, remotionRoot, logLevel);
	} catch (err) {
		const error = err as Error;
		if (error instanceof RenderInternals.SymbolicateableError) {
			await CliInternals.printError(error, logLevel);
		} else {
			const frames = RenderInternals.parseStack(error.stack?.split('\n') ?? []);

			const errorWithStackFrame = new RenderInternals.SymbolicateableError({
				message: error.message,
				frame: null,
				name: error.name,
				stack: error.stack,
				stackFrame: frames,
			});
			await CliInternals.printError(errorWithStackFrame, logLevel);
		}

		quit(1);
	}
};
