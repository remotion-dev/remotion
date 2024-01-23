import {BundlerInternals} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import {StudioServerInternals} from '@remotion/studio-server';
import {existsSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'fs';
import path from 'path';
import {chalk} from './chalk';
import {findEntryPoint} from './entry-point';
import {getCliOptions} from './get-cli-options';
import {Log} from './log';
import {parsedCli, quietFlagProvided} from './parse-command-line';
import {bundleOnCli} from './setup-cache';
import {shouldUseNonOverlayingLogger} from './should-use-non-overlaying-logger';
import {yesOrNo} from './yes-or-no';

export const bundleCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	const {file, reason} = findEntryPoint(args, remotionRoot, logLevel);
	const explicitlyPassed = args[0];
	if (
		explicitlyPassed &&
		reason !== 'argument passed' &&
		reason !== 'argument passed - found in cwd' &&
		reason !== 'argument passed - found in root'
	) {
		Log.error(
			`Entry point was specified as ${chalk.bold(
				explicitlyPassed,
			)}, but it was not found.`,
		);
		process.exit(1);
	}

	const updatesDontOverwrite = shouldUseNonOverlayingLogger({logLevel});

	if (!file) {
		Log.error('No entry point found.');
		Log.error(
			'Pass another argument to the command specifying the entry point.',
		);
		Log.error('See: https://www.remotion.dev/docs/terminology/entry-point');
		process.exit(1);
	}

	const {publicDir} = getCliOptions({
		isLambda: false,
		type: 'get-compositions',
		remotionRoot,
		logLevel,
	});

	const outputPath = parsedCli['out-dir']
		? path.resolve(process.cwd(), parsedCli['out-dir'])
		: path.join(remotionRoot, 'build');

	const gitignoreFolder = BundlerInternals.findClosestFolderWithFile(
		outputPath,
		'.gitignore',
	);
	const existed = existsSync(outputPath);
	if (existed) {
		const existsIndexHtml = existsSync(path.join(outputPath, 'index.html'));
		const isEmpty = readdirSync(outputPath).length === 0;
		if (!existsIndexHtml && !isEmpty) {
			Log.error(
				`The folder at ${outputPath} already exists, and needs to be deleted before a new bundle can be created.`,
			);
			Log.error(
				'However, it does not look like the folder was created by `npx remotion bundle` (no index.html).',
			);
			Log.error('Aborting to prevent accidental data loss.');
			process.exit(1);
		}

		rmSync(outputPath, {recursive: true});
	}

	const output = await bundleOnCli({
		fullPath: file,
		logLevel,
		onDirectoryCreated: () => {},
		bundlingStep: 0,
		indent: false,
		quietProgress: updatesDontOverwrite,
		publicDir,
		steps: 1,
		remotionRoot,
		onProgressCallback: ({bundling, copying}) => {
			// Handle floating point inaccuracies
			if (bundling.progress < 0.99999) {
				if (updatesDontOverwrite) {
					Log.info(`Bundling ${Math.round(bundling.progress * 100)}%`);
				}
			}

			if (copying.doneIn === null) {
				if (updatesDontOverwrite) {
					return `Copying public dir ${StudioServerInternals.formatBytes(
						copying.bytes,
					)}`;
				}
			}
		},
		quietFlag: quietFlagProvided(),
		outDir: outputPath,
	});

	Log.infoAdvanced(
		{indent: false, logLevel},
		chalk.blue(`${existed ? '○' : '+'} ${output}`),
	);

	if (!gitignoreFolder) {
		return;
	}

	// Non-interactive terminal
	if (!process.stdout.isTTY) {
		return;
	}

	const gitignorePath = path.join(gitignoreFolder, '.gitignore');
	const gitIgnoreContents = readFileSync(gitignorePath, 'utf-8');
	const relativePathToGitIgnore = path.relative(gitignoreFolder, outputPath);

	const isInGitIgnore = gitIgnoreContents
		.split('\n')
		.includes(relativePathToGitIgnore);
	if (isInGitIgnore) {
		return;
	}

	const answer = await yesOrNo({
		defaultValue: true,
		question: `Recommended: Add ${chalk.bold(
			relativePathToGitIgnore,
		)} to your ${chalk.bold('.gitignore')} file? (Y/n)`,
	});

	if (!answer) {
		return;
	}

	const newGitIgnoreContents =
		gitIgnoreContents + '\n' + relativePathToGitIgnore;
	writeFileSync(gitignorePath, newGitIgnoreContents);
	Log.infoAdvanced(
		{indent: false, logLevel},
		chalk.blue(`Added to .gitignore!`),
	);
};
