import type {LogLevel} from '@remotion/renderer';
import minimist from 'minimist';
import {importCompositionCommand} from './import-composition-command';
import {Log} from './log';

export const printExperimentalCodemodHelp = (logLevel: LogLevel) => {
	Log.info(
		{indent: false, logLevel},
		[
			'Internal, unstable command. Arguments and behavior may change without notice.',
			'',
			'bunx remotion experimental-codemod add-canvas-capture <file> --composition-file <Root.tsx> --id <composition-id>',
			'',
			'--width <pixels>       Composition width (default: 1920)',
			'--height <pixels>      Composition height (default: 1080)',
			'--fps <number>         Composition and cursor keyframe FPS (default: 60)',
			'--public-dir <path>    Public directory (default: configured directory or public/)',
			'--package-manager <name>  Package manager used to install runtime dependencies',
			'--dry-run             Generate changes without installing packages or writing files',
		].join('\n'),
	);
};

export const experimentalCodemodCommand = async (
	remotionRoot: string,
	argv: string[],
	logLevel: LogLevel,
) => {
	const commandLine = minimist(argv, {
		string: ['_', 'composition-file', 'id'],
		boolean: ['dry-run', 'help'],
	});
	const [, command] = commandLine._;
	if (commandLine.help || command === undefined) {
		printExperimentalCodemodHelp(logLevel);
		return;
	}

	if (command !== 'add-canvas-capture') {
		throw new Error(
			`Unknown experimental codemod: ${command}. Use experimental-codemod --help.`,
		);
	}

	Log.warn(
		{indent: false, logLevel},
		'Use canvas-capture import instead of experimental-codemod add-canvas-capture.',
	);
	const forwarded = argv
		.slice(2)
		.map((arg) =>
			arg === '--id'
				? '--composition'
				: arg.startsWith('--id=')
					? `--composition=${arg.slice(5)}`
					: arg,
		);
	await importCompositionCommand({
		feature: 'canvas-capture',
		remotionRoot,
		argv: ['canvas-capture', 'import', ...forwarded, '--yes'],
		logLevel,
	});
};
