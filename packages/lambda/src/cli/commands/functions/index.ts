import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {BINARY_NAME} from '../../../shared/constants';
import {functionsLsCommand, FUNCTIONS_LS_SUBCOMMAND} from './ls';

export const FUNCTIONS_COMMAND = 'functions';

const printFunctionsHelp = () => {
	Log.info(`${BINARY_NAME} ${FUNCTIONS_COMMAND} <subcommand>`);
	Log.info();
	Log.info('Available subcommands:');
	Log.info('');
	Log.info(`${BINARY_NAME} ${FUNCTIONS_COMMAND} ${FUNCTIONS_LS_SUBCOMMAND}`);
	Log.info(CliInternals.chalk.gray('Lists the functions currently deployed'));
};

export const functionsCommand = (args: string[]) => {
	if (args[0] === FUNCTIONS_LS_SUBCOMMAND) {
		return functionsLsCommand();
	}

	if (args[0]) {
		Log.error(`Subcommand ${args[0]} not found.`);
		printFunctionsHelp();
		process.exit(1);
	}

	printFunctionsHelp();
};
