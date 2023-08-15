import {CliInternals} from '@remotion/cli';
import {BINARY_NAME} from '../../../defaults';
import {INCREASE_SUBCOMMAND, quotasIncreaseCommand} from './increase';
import {quotasListCommand} from './list';
export const QUOTAS_COMMAND = 'quotas';

const printHelp = () => {
	CliInternals.Log.info('Available commands:');
	CliInternals.Log.info();
	CliInternals.Log.info(`npx ${BINARY_NAME} ${QUOTAS_COMMAND}`);
	CliInternals.Log.info(
		CliInternals.chalk.gray('List relevant AWS Lambda quotas.')
	);
	CliInternals.Log.info();
	CliInternals.Log.info(
		`npx ${BINARY_NAME} ${QUOTAS_COMMAND} ${INCREASE_SUBCOMMAND}`
	);
	CliInternals.Log.info(CliInternals.chalk.gray('Increase Lambda quotas.'));
};

export const quotasCommand = (args: string[]) => {
	if (args.filter(Boolean).length === 0) {
		return quotasListCommand();
	}

	if (args[0] === INCREASE_SUBCOMMAND) {
		return quotasIncreaseCommand();
	}

	CliInternals.Log.error('Subcommand ' + args[0] + ' not found.');
	printHelp();
};
