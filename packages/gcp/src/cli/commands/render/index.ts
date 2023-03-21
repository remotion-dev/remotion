import {CliInternals} from '@remotion/cli';
import {Log} from '@remotion/cli/dist/log';
import {BINARY_NAME} from '../../../shared/constants';
import {quit} from '../../helpers/quit';
import {renderMediaSubcommand, RENDER_MEDIA_SUBCOMMAND} from './renderMedia';
import {renderStillSubcommand, RENDER_STILL_SUBCOMMAND} from './renderStill';
import {testAuthSubcommand, TEST_AUTH_SUBCOMMAND} from './testAuth';

export const RENDER_COMMAND = 'render';

const printCloudRunHelp = () => {
	Log.info(`${BINARY_NAME} ${RENDER_COMMAND} <subcommand>`);
	Log.info();
	Log.info('Available subcommands:');
	Log.info('');
	Log.info(`${BINARY_NAME} ${RENDER_COMMAND} ${RENDER_MEDIA_SUBCOMMAND}`);
	Log.info(CliInternals.chalk.gray('Render Media on Cloud Run'));
	Log.info('');
	Log.info(`${BINARY_NAME} ${RENDER_COMMAND} ${RENDER_STILL_SUBCOMMAND}`);
	Log.info(CliInternals.chalk.gray('Render Still on Cloud Run'));
};

// TODO: Add LS, RM, RMALL subcommands

export const renderCommand = (args: string[], remotionRoot: string) => {
	if (args[0] === RENDER_MEDIA_SUBCOMMAND) {
		return renderMediaSubcommand(args.slice(1), remotionRoot);
	}

	if (args[0] === RENDER_STILL_SUBCOMMAND) {
		return renderStillSubcommand(args.slice(1), remotionRoot);
	}

	if (args[0] === TEST_AUTH_SUBCOMMAND) {
		Log.info(`yo`);
		return testAuthSubcommand(args.slice(1));
	}

	if (args[0]) {
		Log.error(`Subcommand ${args[0]} not found.`);
		printCloudRunHelp();
		quit(1);
	}

	printCloudRunHelp();
};
