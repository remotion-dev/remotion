import {Log} from '@remotion/cli/dist/log';
import {quit} from '../../helpers/quit';
import {sitesCreateSubcommand, SITES_CREATE_SUBCOMMAND} from './create';

export const SITES_COMMAND = 'sites';

const printSitesHelp = () => {
	// TODO: Add help text
};

export const sitesCommand = (args: string[], remotionRoot: string) => {
	if (args[0] === SITES_CREATE_SUBCOMMAND) {
		return sitesCreateSubcommand(args.slice(1), remotionRoot);
	}

	if (args[0]) {
		Log.error(`Subcommand ${args[0]} not found.`);
		printSitesHelp();
		quit(1);
	}

	printSitesHelp();
};
