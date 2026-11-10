import {existsSync} from 'node:fs';
import {readFile, realpath} from 'node:fs/promises';
import path from 'node:path';
import {
	addOpenTimelineComposition,
	CodemodsInternals,
	OpenTimelineImportError,
	type CodemodFileChange,
	type CompositionMetadata,
} from '@remotion/codemods';
import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {StudioServerInternals} from '@remotion/studio-server';
import minimist from 'minimist';
import {Internals} from 'remotion';
import {applyCompositionImport} from './apply-composition-import';
import {chalk} from './chalk';
import {getProjectCompositions} from './get-project-compositions';
import {importCanvasCapture} from './import-canvas-capture';
import {Log} from './log';
import {printHelp} from './print-help';
import {yesOrNo} from './yes-or-no';

export const importCompositionCommand = async ({
	feature,
	remotionRoot,
	argv,
	logLevel,
}: {
	feature: 'canvas-capture' | 'open-timeline';
	remotionRoot: string;
	argv: string[];
	logLevel: LogLevel;
}) => {
	const commandLine = minimist(argv, {
		string: [
			'_',
			'composition',
			'composition-file',
			'media-dir',
			'public-dir',
			'package-manager',
		],
		boolean: ['dry-run', 'yes', 'help'],
		alias: {y: 'yes'},
	});
	const [, command, inputFile, ...extraArgs] = commandLine._;
	if (commandLine.help || command === undefined) {
		printHelp(logLevel, [feature, ...(command === undefined ? [] : [command])]);
		return;
	}

	if (command !== 'import' || !inputFile || extraArgs.length > 0) {
		throw new Error(
			`Usage: bunx remotion ${feature} import <file> [--composition <id>] [--yes]`,
		);
	}

	const file = await realpath(path.resolve(inputFile));
	const compositionId =
		commandLine.composition ??
		path
			.basename(inputFile, path.extname(inputFile))
			.replace(/[^a-zA-Z0-9\u4E00-\u9FFF-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	if (
		typeof compositionId !== 'string' ||
		!compositionId ||
		!Internals.isCompositionIdValid(compositionId)
	) {
		throw new Error(
			'Pass a valid composition ID with --composition <id>. Use letters, numbers, CJK characters, or hyphens.',
		);
	}

	const explicitCompositionFile = commandLine['composition-file'];
	if (explicitCompositionFile !== undefined && !explicitCompositionFile) {
		throw new Error(
			'--composition-file must name an existing registration file.',
		);
	}

	const requestedFile =
		explicitCompositionFile === undefined
			? null
			: await realpath(path.resolve(remotionRoot, explicitCompositionFile));
	const {entryPoint, project, compositions} = getProjectCompositions({
		remotionRoot,
		logLevel,
		fallbackFile: requestedFile,
	});
	if (requestedFile !== null && project.files[requestedFile] === undefined) {
		const source = await readFile(requestedFile, 'utf-8');
		project.files[requestedFile] = source;
		compositions.push(
			...CodemodsInternals.getCompositionsInSource(source).map(
				(composition) => ({...composition, file: requestedFile}),
			),
		);
	}

	if (compositions.some((composition) => composition.id === compositionId)) {
		throw new Error(
			`Composition "${compositionId}" already exists. Choose another ID with --composition <id>.`,
		);
	}

	const compositionFile = CodemodsInternals.resolveCompositionImportFile({
		entryPoint,
		project,
		compositionFile: requestedFile,
	});

	const {
		overrideWidthOption,
		overrideHeightOption,
		overrideFpsOption,
		publicDirOption,
		packageManagerOption,
		binariesDirectoryOption,
		openTimelineMediaDirectoryOption,
	} = BrowserSafeApis.options;
	const width = overrideWidthOption.getValue({commandLine}).value;
	const height = overrideHeightOption.getValue({commandLine}).value;
	const fps = overrideFpsOption.getValue({commandLine}).value;
	const publicDir = publicDirOption.getValue({commandLine}).value;
	const packageManager = packageManagerOption.getValue({commandLine}).value;
	let plan: {
		changes: CodemodFileChange[];
		copies: {source: string; destination: string}[];
		dependencies: string[];
		metadata: CompositionMetadata;
	};
	if (feature === 'canvas-capture') {
		plan = await importCanvasCapture({
			captureFile: file,
			compositionFile,
			compositionId,
			remotionRoot,
			publicDir,
			fps,
			width,
			height,
			packageManager,
			logLevel,
			dryRun: true,
		});
	} else {
		const name = (compositionId.match(/[a-zA-Z0-9]+/g) ?? [])
			.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
			.join('');
		const componentName = `${/^[0-9]/.test(name) ? 'Timeline' : ''}${name || 'OpenTimeline'}Composition`;
		const componentFile = path.join(
			path.dirname(compositionFile),
			`${componentName}.tsx`,
		);
		if (existsSync(componentFile)) {
			throw new Error(
				`Cannot create ${componentFile} because it already exists`,
			);
		}

		const contents = await readFile(file, 'utf-8');
		const mediaDirectory = openTimelineMediaDirectoryOption.getValue({
			commandLine,
		}).value;
		const prepared = await StudioServerInternals.prepareOpenTimelineImport({
			request: {
				contents,
				mediaDirectory:
					mediaDirectory === null
						? path.dirname(file)
						: path.resolve(mediaDirectory),
				componentName,
				fps: fps ?? 30,
				width: width ?? 1920,
				height: height ?? 1080,
			},
			publicDir: path.resolve(remotionRoot, publicDir ?? 'public'),
			remotionRoot,
			binariesDirectory: binariesDirectoryOption.getValue({commandLine}).value,
		});
		if (prepared.result.source === null || prepared.result.metadata === null) {
			throw new OpenTimelineImportError(prepared.result.diagnostics);
		}

		const imported = addOpenTimelineComposition({
			project: {
				rootDir: remotionRoot,
				files: {[compositionFile]: await readFile(compositionFile, 'utf-8')},
			},
			compositionFile,
			compositionId,
			component: {
				filePath: componentFile,
				importName: componentName,
				importPath: `./${componentName}`,
			},
			timeline: prepared.timeline,
			...prepared.result.metadata,
			resolveMedia: prepared.resolveMedia,
		});
		for (const diagnostic of imported.diagnostics) {
			Log.warn(
				{indent: false, logLevel},
				`${diagnostic.path}: ${diagnostic.message}`,
			);
		}

		plan = {
			changes: imported.changes,
			copies: prepared.copies,
			dependencies: prepared.result.source.includes("from '@remotion/media'")
				? ['@remotion/media']
				: [],
			metadata: prepared.result.metadata,
		};
	}

	Log.info(
		{indent: false, logLevel},
		`Import ${chalk.blue(path.basename(file))} as ${chalk.bold(`"${compositionId}"`)} ${chalk.gray(`(${plan.metadata.width}×${plan.metadata.height}, ${plan.metadata.fps} fps, ${plan.metadata.durationInFrames} frames)`)}`,
	);
	for (const change of plan.changes) {
		Log.info(
			{indent: false, logLevel},
			chalk.blue(
				`${change.previousContents === null ? '+' : '○'} ${path.relative(remotionRoot, change.filePath)}`,
			),
		);
	}

	for (const copy of plan.copies) {
		Log.info(
			{indent: false, logLevel},
			chalk.blue(`+ ${path.relative(remotionRoot, copy.destination)}`),
		);
	}

	const installedPackages = new Set(
		Object.values(
			StudioServerInternals.getInstalledDependencies(remotionRoot),
		).flat(),
	);
	for (const dependency of plan.dependencies) {
		const installed = installedPackages.has(dependency);
		Log.info(
			{indent: false, logLevel},
			`${installed ? '○' : '+'} ${dependency} ${chalk.gray(installed ? '(already installed)' : '(will install)')}`,
		);
	}

	if (commandLine['dry-run']) {
		Log.info(
			{indent: false, logLevel},
			chalk.gray('Dry run. No files were changed.'),
		);
		return;
	}

	if (!commandLine.yes) {
		if (!process.stdin.isTTY || !process.stdout.isTTY || process.env.CI) {
			throw new Error(
				'Pass --yes to import without confirmation, or --dry-run to preview the changes.',
			);
		}

		const confirmed = await yesOrNo({
			question: 'Import this composition? (y/N)',
			defaultValue: false,
		});
		if (!confirmed) {
			Log.info(
				{indent: false, logLevel},
				chalk.gray('Cancelled. No files were changed.'),
			);
			return;
		}
	}

	await applyCompositionImport({
		remotionRoot,
		...plan,
		packageManager,
		logLevel,
	});
	Log.info(
		{indent: false, logLevel},
		chalk.green(`Imported composition "${compositionId}".`),
	);
};
