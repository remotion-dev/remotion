import type {LogLevel} from '@remotion/renderer';
import {spawn} from 'node:child_process';
import {chalk} from './chalk';
import {Log} from './log';

export const printSkillsHelp = (logLevel: LogLevel) => {
	Log.info({indent: false, logLevel}, chalk.blue('remotion skills'));
	Log.info(
		{indent: false, logLevel},
		'Install or update skills from remotion-dev/skills.',
	);
	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, 'Available subcommands:');
	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, chalk.blue('remotion skills add'));
	Log.info(
		{indent: false, logLevel},
		'Install skills from remotion-dev/skills.',
	);
	Log.info({indent: false, logLevel});
	Log.info({indent: false, logLevel}, chalk.blue('remotion skills update'));
	Log.info(
		{indent: false, logLevel},
		'Update skills from remotion-dev/skills.',
	);
};

export const skillsCommand = (args: string[], logLevel: LogLevel) => {
	const subcommand = args[0];
	const restArgs = args.slice(1);

	if (!subcommand || !['add', 'update'].includes(subcommand)) {
		printSkillsHelp(logLevel);
		return;
	}

	const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
	const fullArgs = [
		'-y',
		'--loglevel=error',
		'skills',
		subcommand,
		'remotion-dev/skills',
		...restArgs,
	];

	const child = spawn(command, fullArgs, {
		stdio: 'inherit',
	});

	return new Promise<void>((resolve, reject) => {
		child.on('exit', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`The skills command failed with exit code ${code}`));
			}
		});

		child.on('error', (err) => {
			reject(err);
		});
	});
};
