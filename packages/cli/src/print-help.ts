import {chalk} from './chalk';
import {Log} from './log';
import {VERSIONS_COMMAND} from './versions';

const packagejson = require('../package.json');

const printFlags = (flags: [string, string][]) => {
	flags.forEach(([flag, description]) => {
		Log.info(chalk.blue(`${flag.padEnd(22, ' ')} ${description}`));
	});
};

export const printHelp = () => {
	Log.info(
		`@remotion/cli ${
			packagejson.version
		} © ${new Date().getFullYear()} The Remotion developers`
	);
	Log.info();
	Log.info('Available commands:');
	Log.info('');
	Log.info('remotion studio <entry-point.ts>');
	Log.info(chalk.gray('Start the Remotion studio.'));
	printFlags([['--props', 'Pass input props as filename or as JSON']]);
	Log.info();
	Log.info('remotion render <entry-point.ts> <comp-id> <output-file.mp4>');
	Log.info(chalk.gray('Render video, audio or an image sequence.'));
	printFlags([
		['--props', 'Pass input props as filename or as JSON'],
		['--concurrency', 'How many frames to render in parallel'],
		['--image-format', 'Format to render the video/still in'],
		['--pixel-format', 'Custom pixel format, see docs for available values'],
		['--config', 'Custom location for a Remotion config file'],
		['--jpeg-quality', 'Quality for rendered frames, JPEG only, 0-100'],
		['--overwrite', 'Overwrite if file exists, default true'],
		['--sequence', 'Output as an image sequence'],
		['--codec', 'Video of audio codec'],
		['--audio-bitrate', 'Customize the output audio bitrate'],
		['--video-bitrate', 'Customize the output video bitrate'],
		['--crf', 'FFMPEG CRF value, controls quality, see docs for info'],
		['--browser-executable', 'Custom path for browser executable'],
		['--frames', 'Render a portion or a still of a video'],
		['--bundle-cache', 'Cache webpack bundle, boolean, default true'],
		['--log', 'Log level, "error", "warning", "verbose", "info" (default)'],
		['--port', 'Custom port to use for the HTTP server'],
		['--env-file', 'Specify a location for a dotenv file'],
	]);
	Log.info();
	Log.info('remotion still <entry-point.ts> <comp-id> <still.png>');
	Log.info(chalk.gray('Render a still frame and save it as an image.'));
	printFlags([
		['--frame', 'Which frame to render (default 0)'],
		['--image-format', 'Format to render the video/still in'],
		['--props', 'Pass input props as filename or as JSON'],
		['--config', 'Custom location for a Remotion config file'],
		['--jpeg-quality', 'Quality for rendered frames, JPEG only, 0-100'],
		['--overwrite', 'Overwrite if file exists, default true'],
		['--browser-executable', 'Custom path for browser executable'],
		['--bundle-cache', 'Cache webpack bundle, boolean, default true'],
		['--log', 'Log level, "error", "warning", "verbose", "info" (default)'],
		['--port', 'Custom port to use for the HTTP server'],
		['--env-file', 'Specify a location for a dotenv file'],
	]);
	Log.info();
	Log.info('remotion compositions <index-file.ts>');
	Log.info(chalk.gray('Prints the available compositions.'));
	Log.info();
	Log.info('remotion benchmark <index-file.ts> <list-of-compositions>');
	Log.info(
		chalk.gray(
			'Benchmarks rendering a composition. Same options as for render.'
		)
	);
	Log.info();
	Log.info('remotion ' + VERSIONS_COMMAND);
	Log.info(
		chalk.gray('Prints and validates versions of all Remotion packages.')
	);
	Log.info();
	Log.info('remotion upgrade');
	Log.info(chalk.gray('Ensure Remotion is on the newest version.'));
	printFlags([
		[
			'--package-manager',
			'Force a specific package manager, defaults to use from lockfile',
		],
	]);
	Log.info();
	Log.info(
		'Visit https://www.remotion.dev/docs/cli for browsable CLI documentation.'
	);
};
