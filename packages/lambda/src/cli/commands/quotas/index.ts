import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {BINARY_NAME} from '../../../defaults';
import {INCREASE_SUBCOMMAND, quotasIncreaseCommand} from './increase';
import {quotasListCommand} from './list';
export const QUOTAS_COMMAND = 'quotas';

const printHelp = () => {
	Log.info('Available commands:');
	Log.info();
	Log.info(`npx ${BINARY_NAME} ${QUOTAS_COMMAND}`);
	Log.info(CliInternals.chalk.gray('List relevant AWS Lambda quotas.'));
	Log.info();
	Log.info(`npx ${BINARY_NAME} ${QUOTAS_COMMAND} ${INCREASE_SUBCOMMAND}`);
	Log.info(CliInternals.chalk.gray('Increase Lambda quotas.'));
};

export const quotasCommand = (args: string[]) => {
	if (args.filter(Boolean).length === 0) {
		return quotasListCommand();
	}

	if (args[0] === INCREASE_SUBCOMMAND) {
		return quotasIncreaseCommand();
	}

	Log.error('Subcommand ' + args[0] + ' not found.');
	printHelp();
};
