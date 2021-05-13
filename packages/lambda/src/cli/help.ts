import chalk from 'chalk';
import {Log} from './log';

const packagejson = require('../../package.json');

export const printHelp = () => {
	Log.info(
		`@remotion/lambda ${
			packagejson.version
		} © ${new Date().getFullYear()} Jonny Burger`
	);
	Log.info();
	Log.info('Available commands:');
	Log.info('');
	Log.info('@remotion/lambda deploy <index-file.ts>');
	Log.info(chalk.gray('Deploy a lambda.'));
};
