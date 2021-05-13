import chalk from 'chalk';
import {BINARY_NAME} from '../bundle-remotion';
import {Log} from './log';

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
	Log.info(`${BINARY_NAME} deploy <index-file.ts>`);
	Log.info(chalk.gray('Deploy a lambda.'));
};
