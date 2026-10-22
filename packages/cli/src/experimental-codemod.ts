import path from 'node:path';
import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import minimist from 'minimist';
import {importCanvasCapture} from './import-canvas-capture';
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
	const [, command, captureFile] = commandLine._;
	if (commandLine.help || command === undefined) {
		printExperimentalCodemodHelp(logLevel);
		return;
	}

	if (command !== 'add-canvas-capture') {
		throw new Error(
			`Unknown experimental codemod: ${command}. Use experimental-codemod --help.`,
		);
	}

	const compositionFile = commandLine['composition-file'];
	const compositionId = commandLine.id;
	if (
		commandLine._.length !== 3 ||
		typeof captureFile !== 'string' ||
		!captureFile ||
		typeof compositionFile !== 'string' ||
		!compositionFile ||
		typeof compositionId !== 'string' ||
		!compositionId
	) {
		throw new Error(
			'Usage: bunx remotion experimental-codemod add-canvas-capture <file> --composition-file <Root.tsx> --id <composition-id>',
		);
	}

	Log.warn(
		{indent: false, logLevel},
		'experimental-codemod is internal and unstable. Arguments and behavior may change without notice.',
	);
	const {
		overrideWidthOption,
		overrideHeightOption,
		overrideFpsOption,
		publicDirOption,
		packageManagerOption,
	} = BrowserSafeApis.options;
	const result = await importCanvasCapture({
		captureFile: path.resolve(captureFile),
		compositionFile,
		compositionId,
		remotionRoot,
		publicDir: publicDirOption.getValue({commandLine}).value,
		width: overrideWidthOption.getValue({commandLine}).value,
		height: overrideHeightOption.getValue({commandLine}).value,
		fps: overrideFpsOption.getValue({commandLine}).value,
		packageManager: packageManagerOption.getValue({commandLine}).value,
		logLevel,
		dryRun: commandLine['dry-run'],
	});
	Log.info(
		{indent: false, logLevel},
		`${commandLine['dry-run'] ? 'Would import' : 'Imported'} Canvas Capture as "${result.compositionId}" (${result.metadata.width}×${result.metadata.height}, ${result.metadata.fps} fps, ${result.metadata.durationInFrames} frames)`,
	);
	for (const file of [
		result.compositionFile,
		result.componentFile,
		result.videoFile,
	]) {
		Log.info({indent: false, logLevel}, path.relative(remotionRoot, file));
	}
};
