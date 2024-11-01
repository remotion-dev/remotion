import {CliInternals} from '@remotion/cli';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {parsedCloudrunCli} from './args';
import {PERMISSIONS_COMMAND, permissionsCommand} from './commands/permissions';
import {REGIONS_COMMAND, regionsCommand} from './commands/regions';
import {RENDER_COMMAND, renderCommand} from './commands/render';
import {SERVICES_COMMAND, servicesCommand} from './commands/services';
import {SITES_COMMAND, sitesCommand} from './commands/sites';
import {STILL_COMMAND, stillCommand} from './commands/still';
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
		return regionsCommand(logLevel);
	}

	if (args[0] === PERMISSIONS_COMMAND) {
		return permissionsCommand(logLevel);
	}

	if (args[0] === 'deploy') {
		Log.info({indent: false, logLevel}, `The "deploy" command does not exist.`);
		Log.info({indent: false, logLevel}, `Did you mean "service deploy"?`);
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
				chunk: null,
			});
			await CliInternals.printError(errorWithStackFrame, logLevel);
		}

		quit(1);
	}
};
