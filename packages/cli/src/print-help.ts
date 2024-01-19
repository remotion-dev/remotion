import {chalk} from './chalk';
import {GPU_COMMAND} from './gpu';
import {Log} from './log';
import {VERSIONS_COMMAND} from './versions';

const packagejson = require('../package.json');

export const printHelp = () => {
	Log.info(`@remotion/cli ${packagejson.version}`);
	Log.info(`© ${new Date().getFullYear()} Remotion AG`);
	Log.info();
	Log.info('Available commands:');

	Log.info();
	Log.info(chalk.blue('remotion studio') + chalk.gray(' <entry-point.ts>'));
	Log.info('Start the Remotion studio.');
	Log.info(chalk.gray('https://www.remotion.dev/docs/cli/studio'));

	Log.info();
	Log.info(
		chalk.blue('remotion render') +
			chalk.gray(' <entry-point.ts> <comp-id> <output-file.mp4>'),
	);
	Log.info('Render video, audio or an image sequence.');
	Log.info(chalk.gray('https://www.remotion.dev/docs/cli/render'));

	Log.info();
	Log.info(
		chalk.blue('remotion still') +
			chalk.gray(' <entry-point.ts> <comp-id> <still.png>'),
	);
	Log.info('Render a still frame and save it as an image.');
	Log.info(chalk.gray('https://www.remotion.dev/docs/cli/still'));

	Log.info();
	Log.info(chalk.blue('remotion bundle') + chalk.gray(' <entry-point.ts>'));
	Log.info('Create a Remotion bundle to be deployed to the web.');
	Log.info(chalk.gray('https://www.remotion.dev/docs/cli/bundle'));

	Log.info();
	Log.info(
		chalk.blue('remotion compositions') + chalk.gray(' <index-file.ts>'),
	);
	Log.info('Prints the available compositions.');
	Log.info(chalk.gray('https://www.remotion.dev/docs/cli/compositions'));

	Log.info();
	Log.info(
		chalk.blue('remotion benchmark') +
			chalk.gray(' <index-file.ts> <list-of-compositions>'),
	);
	Log.info('Benchmarks rendering a composition. Same options as for render.');
	Log.info(chalk.gray('https://www.remotion.dev/docs/cli/benchmark'));

	Log.info();
	Log.info(chalk.blue('remotion ' + VERSIONS_COMMAND));
	Log.info('Prints and validates versions of all Remotion packages.');
	Log.info(chalk.gray('https://www.remotion.dev/docs/cli/versions'));

	Log.info();
	Log.info(chalk.blue('remotion ' + GPU_COMMAND));
	Log.info('Prints information about how Chrome uses the CPU.');
	Log.info(chalk.gray('https://www.remotion.dev/docs/cli/gpu'));

	Log.info();
	Log.info(chalk.blue('remotion upgrade'));
	Log.info('Ensure Remotion is on the newest version.');
	Log.info(chalk.gray('https://www.remotion.dev/docs/cli/upgrade'));

	Log.info();
	Log.info(
		'Visit https://www.remotion.dev/docs/cli for browsable CLI documentation.',
	);
};
