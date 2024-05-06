import type {LogLevel} from '@remotion/renderer';
import {BROWSER_COMMAND} from './browser';
import {chalk} from './chalk';
import {GPU_COMMAND} from './gpu';
import {Log} from './log';
import {VERSIONS_COMMAND} from './versions';

const packagejson = require('../package.json');

export const printHelp = (logLevel: LogLevel) => {
	Log.info({indent: false, logLevel}, `@remotion/cli ${packagejson.version}`);
	Log.info(
		{indent: false, logLevel},
		`© ${new Date().getFullYear()} Remotion AG`,
	);
	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, 'Available commands:');

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		chalk.blue('remotion studio') + chalk.gray(' <entry-point.ts>'),
	);
	Log.info({indent: false, logLevel}, 'Start the Remotion studio.');
	Log.info(
		{indent: false, logLevel},
		chalk.gray('https://www.remotion.dev/docs/cli/studio'),
	);

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		chalk.blue('remotion render') +
			chalk.gray(' <entry-point.ts> <comp-id> <output-file.mp4>'),
	);
	Log.info(
		{indent: false, logLevel},
		'Render video, audio or an image sequence.',
	);
	Log.info(
		{indent: false, logLevel},
		chalk.gray('https://www.remotion.dev/docs/cli/render'),
	);

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		chalk.blue('remotion still') +
			chalk.gray(' <entry-point.ts> <comp-id> <still.png>'),
	);
	Log.info(
		{indent: false, logLevel},
		'Render a still frame and save it as an image.',
	);
	Log.info(
		{indent: false, logLevel},
		chalk.gray('https://www.remotion.dev/docs/cli/still'),
	);

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		chalk.blue('remotion bundle') + chalk.gray(' <entry-point.ts>'),
	);
	Log.info(
		{indent: false, logLevel},
		'Create a Remotion bundle to be deployed to the web.',
	);
	Log.info(
		{indent: false, logLevel},
		chalk.gray('https://www.remotion.dev/docs/cli/bundle'),
	);

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		chalk.blue('remotion compositions') + chalk.gray(' <index-file.ts>'),
	);
	Log.info({indent: false, logLevel}, 'Prints the available compositions.');
	Log.info(
		{indent: false, logLevel},
		chalk.gray('https://www.remotion.dev/docs/cli/compositions'),
	);

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		chalk.blue('remotion benchmark') +
			chalk.gray(' <index-file.ts> <list-of-compositions>'),
	);
	Log.info(
		{indent: false, logLevel},
		'Benchmarks rendering a composition. Same options as for render.',
	);
	Log.info(
		{indent: false, logLevel},
		chalk.gray('https://www.remotion.dev/docs/cli/benchmark'),
	);

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		chalk.blue('remotion ' + VERSIONS_COMMAND),
	);
	Log.info(
		{indent: false, logLevel},
		'Prints and validates versions of all Remotion packages.',
	);
	Log.info(
		{indent: false, logLevel},
		chalk.gray('https://www.remotion.dev/docs/cli/versions'),
	);

	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, chalk.blue('remotion ' + GPU_COMMAND));
	Log.info(
		{indent: false, logLevel},
		'Prints information about how Chrome uses the CPU.',
	);
	Log.info(
		{indent: false, logLevel},
		chalk.gray('https://www.remotion.dev/docs/cli/gpu'),
	);

	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, chalk.blue('remotion upgrade'));
	Log.info(
		{indent: false, logLevel},
		'Ensure Remotion is on the newest version.',
	);
	Log.info(
		{indent: false, logLevel},
		chalk.gray('https://www.remotion.dev/docs/cli/upgrade'),
	);

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		chalk.blue(`remotion ${BROWSER_COMMAND}`),
	);
	Log.info(
		{indent: false, logLevel},
		'Ensure Remotion has a browser it can use for rendering.',
	);
	Log.info(
		{indent: false, logLevel},
		chalk.gray('https://www.remotion.dev/docs/cli/browser'),
	);

	Log.info({indent: false, logLevel});
	Log.info(
		{indent: false, logLevel},
		'Visit https://www.remotion.dev/docs/cli for browsable CLI documentation.',
	);
};
