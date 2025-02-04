import {BundlerInternals} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {StudioServerInternals} from '@remotion/studio-server';
import {existsSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'fs';
import path from 'path';
import {chalk} from './chalk';
import {findEntryPoint} from './entry-point';
import {getGitSource} from './get-github-repository';
import {Log} from './log';
import {parsedCli, quietFlagProvided} from './parsed-cli';
import {bundleOnCli} from './setup-cache';
import {shouldUseNonOverlayingLogger} from './should-use-non-overlaying-logger';
import {yesOrNo} from './yes-or-no';

const {publicPathOption, publicDirOption, disableGitSourceOption} =
	BrowserSafeApis.options;

export const bundleCommand = async (
	remotionRoot: string,
	args: string[],
	logLevel: LogLevel,
) => {
	const {file, reason} = findEntryPoint({
		args,
		remotionRoot,
		logLevel,
		allowDirectory: false,
	});
	const explicitlyPassed = args[0];
	if (
		explicitlyPassed &&
		reason !== 'argument passed' &&
		reason !== 'argument passed - found in cwd' &&
		reason !== 'argument passed - found in root'
	) {
		Log.error(
			{indent: false, logLevel},
			`Entry point was specified as ${chalk.bold(
				explicitlyPassed,
			)}, but it was not found.`,
		);
		process.exit(1);
	}

	const updatesDontOverwrite = shouldUseNonOverlayingLogger({logLevel});

	if (!file) {
		Log.error({indent: false, logLevel}, 'No entry point found.');
		Log.error(
			{indent: false, logLevel},
			'Pass another argument to the command specifying the entry point.',
		);
		Log.error(
			{indent: false, logLevel},
			'See: https://www.remotion.dev/docs/terminology/entry-point',
		);
		process.exit(1);
	}

	const publicPath = publicPathOption.getValue({commandLine: parsedCli}).value;
	const publicDir = publicDirOption.getValue({commandLine: parsedCli}).value;
	const disableGitSource = disableGitSourceOption.getValue({
		commandLine: parsedCli,
	}).value;

	const outputPath = parsedCli['out-dir']
		? path.resolve(process.cwd(), parsedCli['out-dir'])
		: path.join(remotionRoot, 'build');

	const gitignoreFolder = BundlerInternals.findClosestFolderWithItem(
		outputPath,
		'.gitignore',
	);
	const existed = existsSync(outputPath);
	if (existed) {
		const existsIndexHtml = existsSync(path.join(outputPath, 'index.html'));
		const isEmpty = readdirSync(outputPath).length === 0;
		if (!existsIndexHtml && !isEmpty) {
			Log.error(
				{indent: false, logLevel},
				`The folder at ${outputPath} already exists, and needs to be deleted before a new bundle can be created.`,
			);
			Log.error(
				{indent: false, logLevel},
				'However, it does not look like the folder was created by `npx remotion bundle` (no index.html).',
			);
			Log.error(
				{indent: false, logLevel},
				'Aborting to prevent accidental data loss.',
			);
			process.exit(1);
		}

		rmSync(outputPath, {recursive: true});
	}

	const gitSource = getGitSource({remotionRoot, disableGitSource, logLevel});

	const output = await bundleOnCli({
		fullPath: file,
		logLevel,
		onDirectoryCreated: () => {},
		indent: false,
		quietProgress: updatesDontOverwrite,
		publicDir,
		remotionRoot,
		onProgressCallback: ({bundling, copying}) => {
			// Handle floating point inaccuracies
			if (bundling.progress < 0.99999) {
				if (updatesDontOverwrite) {
					Log.info(
						{indent: false, logLevel},
						`Bundling ${Math.round(bundling.progress * 100)}%`,
					);
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
		gitSource,
		bufferStateDelayInMilliseconds: null,
		maxTimelineTracks: null,
		publicPath,
	});

	Log.info(
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
	Log.info({indent: false, logLevel}, chalk.blue(`Added to .gitignore!`));
};
