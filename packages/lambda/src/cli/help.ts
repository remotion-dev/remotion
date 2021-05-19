import chalk from 'chalk';
import {BINARY_NAME} from '../bundle-remotion';
import {CLEANUP_COMMAND} from './cleanup';
import {Log} from './log';
import {RENDER_COMMAND} from './render';
import {UPLOAD_COMMAND} from './upload';

const packagejson = require('../../package.json');

export const printHelp = () => {
	Log.info(
		`${BINARY_NAME} ${
			packagejson.version
		} © ${new Date().getFullYear()} Jonny Burger`
	);
	Log.info();
	Log.info('Available commands:');
	Log.info('');
	Log.info(`${BINARY_NAME} ${UPLOAD_COMMAND} <index-file.ts>`);
	Log.info(chalk.gray('Upload a Remotion project to S3.'));
	Log.info();

	Log.info(`${BINARY_NAME} ${RENDER_COMMAND} <s3-url>`);
	Log.info(chalk.gray('Render a video on the cloud.'));

	Log.info();
	Log.info(`${BINARY_NAME} ${CLEANUP_COMMAND}`);
	Log.info(
		chalk.gray('Delete Remotion-related infrastructure from your AWS account.')
	);
};
