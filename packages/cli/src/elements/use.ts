import {existsSync, readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {CodemodsInternals} from '@remotion/codemods';
import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {StudioElementPayload} from '@remotion/studio-protocol';
import {
	ELEMENT_PAYLOAD_MIME_TYPE,
	StudioProtocolInternals,
} from '@remotion/studio-protocol';
import {StudioServerInternals} from '@remotion/studio-server';
import {
	getMissingPackageDependencies,
	withRequiredAuxiliaryPackages,
	type InstallableElement,
} from '@remotion/studio-shared';
import minimist from 'minimist';
import {chalk} from '../chalk';
import {selectAsync} from '../composition-prompts';
import {findEntryPoint} from '../entry-point';
import {Log} from '../log';
import {parsedCli} from '../parsed-cli';
import {yesOrNo} from '../yes-or-no';

export const USE_COMMAND = 'use';

const PAYLOAD_DOCS_URL =
	'https://www.remotion.dev/docs/studio-protocol/serialize-element-payload-for-html';
const FETCH_TIMEOUT_IN_MILLISECONDS = 30_000;
const MAX_PAGE_SIZE_IN_BYTES = 20 * 1024 * 1024;

export const elementsUseCommand = async ({
	remotionRoot,
	argv,
	logLevel,
}: {
	remotionRoot: string;
	argv: string[];
	logLevel: LogLevel;
}) => {
	const fail = (message: string): never => {
		Log.error({indent: false, logLevel}, message);
		process.exit(1);
	};

	const commandLine = minimist(argv, {
		string: ['_', 'element', 'composition'],
		boolean: ['yes', 'overwrite'],
		alias: {y: 'yes'},
	});
	// The first two positional arguments are `elements use`.
	const [, , pageUrl, ...extraArgs] = commandLine._;
	if (pageUrl === undefined || extraArgs.length > 0) {
		return fail(
			`Usage: npx remotion elements ${USE_COMMAND} <url> [--element <slug>] [--composition <id>] [--yes]`,
		);
	}

	let sourceUrl: URL;
	try {
		sourceUrl = new URL(pageUrl);
	} catch {
		return fail(`"${pageUrl}" is not a valid URL.`);
	}

	if (sourceUrl.protocol !== 'http:' && sourceUrl.protocol !== 'https:') {
		return fail(`"${pageUrl}" must be an http:// or https:// URL.`);
	}

	const fetchText = async (url: URL) => {
		const controller = new AbortController();
		const timeout = setTimeout(
			() => controller.abort(),
			FETCH_TIMEOUT_IN_MILLISECONDS,
		);
		let response: Awaited<ReturnType<typeof StudioServerInternals.httpGet>>;
		try {
			response = await StudioServerInternals.httpGet({
				url,
				headers: {
					accept: `text/html, ${ELEMENT_PAYLOAD_MIME_TYPE}, application/json;q=0.9, */*;q=0.8`,
				},
				signal: controller.signal,
				maxSize: MAX_PAGE_SIZE_IN_BYTES,
				tooLargeMessage: `The response is larger than ${MAX_PAGE_SIZE_IN_BYTES / 1024 / 1024}MB.`,
				maxRedirects: 10,
				validateUrl: null,
			});
		} catch (err) {
			return fail(
				`Could not fetch ${url.href}: ${controller.signal.aborted ? `Timed out after ${FETCH_TIMEOUT_IN_MILLISECONDS / 1000} seconds.` : (err as Error).message}`,
			);
		} finally {
			clearTimeout(timeout);
		}

		if (response.statusCode < 200 || response.statusCode >= 300) {
			return fail(
				`Could not fetch ${url.href}: The server responded with HTTP ${response.statusCode}.`,
			);
		}

		return {
			text: new TextDecoder().decode(response.body),
			url: response.url,
			isJson: /json/i.test(response.headers['content-type'] ?? ''),
		};
	};

	const parseJsonPayload = (text: string, url: URL) => {
		let json: unknown;
		try {
			json = JSON.parse(text);
		} catch {
			return fail(`${url.href} did not return valid JSON.`);
		}

		const parsedPayload =
			StudioProtocolInternals.parseStudioElementPayload(json);
		if (parsedPayload === null) {
			return fail(
				`${url.href} does not contain a valid Element payload. Create it with createElementPayload(): https://www.remotion.dev/docs/studio-protocol/create-element-payload`,
			);
		}

		return parsedPayload;
	};

	Log.verbose({indent: false, logLevel}, `Fetching ${sourceUrl.href}`);
	const page = await fetchText(sourceUrl);
	let payloads: StudioElementPayload[];
	if (page.isJson || page.text.trimStart().startsWith('{')) {
		payloads = [parseJsonPayload(page.text, page.url)];
	} else {
		const parsed = StudioProtocolInternals.parseElementPayloadsFromHtml(
			page.text,
		);
		payloads = parsed.payloads;
		if (payloads.length === 0) {
			for (const href of parsed.alternateHrefs) {
				const alternateUrl = new URL(href, page.url);
				Log.verbose(
					{indent: false, logLevel},
					`Fetching linked Element payload ${alternateUrl.href}`,
				);
				const alternate = await fetchText(alternateUrl);
				payloads.push(parseJsonPayload(alternate.text, alternate.url));
			}
		}

		if (payloads.length === 0) {
			return fail(
				parsed.invalidPayloadCount > 0
					? `${sourceUrl.href} embeds an Element payload, but it is not valid. Create it with createElementPayload() and serializeElementPayloadForHtml(): ${PAYLOAD_DOCS_URL}`
					: `No Element found on ${sourceUrl.href}. The Element library must embed the Element payload in the page's HTML: ${PAYLOAD_DOCS_URL}`,
			);
		}
	}

	const requestedSlug = commandLine.element as string | undefined;
	const availableSlugs = [...new Set(payloads.map((p) => p.element.slug))];
	if (requestedSlug === undefined && availableSlugs.length > 1) {
		return fail(
			[
				`${sourceUrl.href} contains ${availableSlugs.length} Elements. Choose one with --element <slug>:`,
				...availableSlugs.map((slug) => `  ${slug}`),
			].join('\n'),
		);
	}

	const payload =
		requestedSlug === undefined
			? payloads[0]!
			: (payloads.find((p) => p.element.slug === requestedSlug) ??
				fail(
					[
						`${sourceUrl.href} does not contain an Element with the slug "${requestedSlug}". Available Elements:`,
						...availableSlugs.map((slug) => `  ${slug}`),
					].join('\n'),
				));
	const element: InstallableElement = {
		...payload.element,
		durationInFrames: payload.element.durationInFrames ?? null,
		initialProps: payload.element.initialProps ?? null,
		installationMode: payload.element.installationMode ?? null,
		isCaptionStyle: payload.element.isCaptionStyle ?? false,
	};

	const {file: entryPoint} = findEntryPoint({
		args: [],
		remotionRoot,
		logLevel,
		allowDirectory: false,
	});
	if (entryPoint === null) {
		return fail(
			'Could not find the entry point of your Remotion project. Set it with Config.setEntryPoint(): https://www.remotion.dev/docs/config#setentrypoint',
		);
	}

	// Find compositions in the source code, the same place where the Element gets inserted.
	const compositions: Array<{
		id: string;
		width: number | null;
		height: number | null;
		file: string;
	}> = [];
	const sourceDirectories = [path.dirname(entryPoint)];
	for (const directory of sourceDirectories) {
		for (const entry of readdirSync(directory, {withFileTypes: true})) {
			const fullPath = path.join(directory, entry.name);
			if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
				continue;
			}

			if (entry.isDirectory()) {
				sourceDirectories.push(fullPath);
				continue;
			}

			if (!entry.isFile() || !/\.(tsx|ts|jsx|js|mjs)$/.test(entry.name)) {
				continue;
			}

			const source = readFileSync(fullPath, 'utf-8');
			if (!/<[\w.]*(Composition|Still)\b/.test(source)) {
				continue;
			}

			try {
				for (const found of CodemodsInternals.getCompositionsInSource(source)) {
					compositions.push({...found, file: fullPath});
				}
			} catch {
				// Skip files that cannot be parsed.
			}
		}
	}

	const compositionIds = [...new Set(compositions.map((c) => c.id))];
	if (compositionIds.length === 0) {
		return fail(
			`Could not find a <Composition> with a string id in ${path.relative(process.cwd(), path.dirname(entryPoint)) || '.'}.`,
		);
	}

	const listOfCompositions = compositionIds.map((id) => `  ${id}`).join('\n');
	const isInteractive = Boolean(
		process.stdin.isTTY && process.stdout.isTTY && !process.env.CI,
	);
	const requestedCompositionId = commandLine.composition as string | undefined;
	let compositionId: string;
	if (requestedCompositionId !== undefined) {
		if (!compositionIds.includes(requestedCompositionId)) {
			return fail(
				`Could not find a composition with the ID "${requestedCompositionId}". Available compositions:\n${listOfCompositions}`,
			);
		}

		compositionId = requestedCompositionId;
	} else if (compositionIds.length === 1) {
		compositionId = compositionIds[0]!;
	} else if (isInteractive) {
		compositionId = (await selectAsync(
			{
				message: 'Select the composition to add the Element to:',
				optionsPerPage: 10,
				type: 'select',
				choices: compositionIds.map((id) => ({
					value: id,
					title: chalk.bold(id),
				})),
			},
			logLevel,
		)) as string;
	} else {
		return fail(
			`Pass the composition to add the Element to with --composition <id>. Available compositions:\n${listOfCompositions}`,
		);
	}

	const matchingCompositions = compositions.filter(
		(c) => c.id === compositionId,
	);
	if (matchingCompositions.length > 1) {
		return fail(
			`The composition "${compositionId}" is defined in multiple files: ${matchingCompositions.map((c) => path.relative(remotionRoot, c.file)).join(', ')}`,
		);
	}

	const composition = matchingCompositions[0]!;
	const compositionFile = path.relative(remotionRoot, composition.file);

	let plan: Awaited<
		ReturnType<typeof StudioServerInternals.getElementInstallPlan>
	>;
	try {
		plan = await StudioServerInternals.getElementInstallPlan({
			installationName: null,
			destination: {
				type: 'current-composition',
				compositionFile,
				compositionId,
			},
			element,
			entryPoint,
			remotionRoot,
		});
	} catch (err) {
		return fail(
			`Cannot add ${element.displayName} to the composition "${compositionId}": ${(err as Error).message}`,
		);
	}

	const existingFileIsIdentical =
		plan.existingElementSource === element.sourceCode;
	if (
		plan.existingElementSource !== null &&
		!existingFileIsIdentical &&
		!commandLine.overwrite
	) {
		return fail(
			`${plan.filePath} already exists with different contents. Pass --overwrite to replace it.`,
		);
	}

	const missingDependencies = withRequiredAuxiliaryPackages(
		getMissingPackageDependencies({
			dependencies: element.dependencies,
			installedPackages:
				StudioServerInternals.getInstalledInstallablePackages(remotionRoot),
		}),
	);
	const relativePublicDir = BrowserSafeApis.options.publicDirOption.getValue({
		commandLine: parsedCli,
	}).value;
	const publicDir = relativePublicDir
		? path.resolve(remotionRoot, relativePublicDir)
		: path.join(remotionRoot, 'public');
	const assetPaths = element.assets.map((asset) =>
		path
			.relative(remotionRoot, path.join(publicDir, ...asset.path.split('/')))
			.split(path.sep)
			.join('/'),
	);
	const compositionComponentFile = path
		.relative(plan.safePaths.remotionRoot, plan.safePaths.compositionFileName)
		.split(path.sep)
		.join('/');

	const formatDependency = (dependency: {
		name: string;
		version: string | null;
	}) =>
		dependency.version === null
			? dependency.name
			: `${dependency.name}@${dependency.version}`;
	const summary: Array<[string, string]> = [
		['Source', sourceUrl.href],
		['Element', `${element.displayName} (${element.slug})`],
		[
			plan.existingElementSource === null
				? 'Creates'
				: existingFileIsIdentical
					? 'Reuses'
					: 'Overwrites',
			plan.filePath,
		],
		['Changes', `${compositionComponentFile} (composition "${compositionId}")`],
		[
			'Installs',
			element.dependencies.length === 0
				? 'No packages'
				: [
						...missingDependencies.map(formatDependency),
						...[
							...new Set(
								element.dependencies
									.filter(
										(dependency) =>
											!missingDependencies.some(
												(missing) => missing.name === dependency.name,
											),
									)
									.map((dependency) => dependency.name),
							),
						].map((name) => `${name} (already installed)`),
					].join(', '),
		],
		['Assets', assetPaths.length === 0 ? 'None' : assetPaths.join(', ')],
	];
	Log.info({indent: false, logLevel});
	for (const [label, value] of summary) {
		Log.info(
			{indent: false, logLevel},
			`${chalk.gray(label.padEnd(12))}${value}`,
		);
	}

	Log.info({indent: false, logLevel});

	if (!commandLine.yes) {
		if (!isInteractive) {
			return fail(
				'Installing an Element runs its code in your project. Pass --yes to install it without confirmation.',
			);
		}

		const confirmed = await yesOrNo({
			question: `The Element's source code comes from ${sourceUrl.host} and will run in your project. Install it? (y/N)`,
			defaultValue: false,
		});
		if (!confirmed) {
			return fail('Cancelled. No files were changed.');
		}
	}

	const position =
		element.dimensions === null ||
		composition.width === null ||
		composition.height === null
			? null
			: {
					x: composition.width / 2 - element.dimensions.width / 2,
					y: composition.height / 2 - element.dimensions.height / 2,
				};

	const newAssetPaths = assetPaths.filter(
		(assetPath) => !existsSync(path.join(remotionRoot, assetPath)),
	);
	const installResult = await StudioServerInternals.installElement({
		installationName: null,
		captionTarget: null,
		compositionFile,
		compositionId,
		newComposition: null,
		element,
		expectedFileState: plan.expectedFileState,
		from: 0,
		position,
		overwriteExisting: plan.existingElementSource !== null,
		undoRedoNavigation: null,
		entryPoint,
		remotionRoot,
		publicDir,
		binariesDirectory: null,
		logLevel,
		installDependencies: true,
		studio: false,
	});

	if (!installResult.success) {
		return fail(
			installResult.type === 'file-conflict'
				? `${installResult.conflict.filePath} changed while installing. Run the command again.`
				: `Could not install ${element.displayName}: ${installResult.reason}`,
		);
	}

	for (const assetPath of newAssetPaths) {
		Log.info(
			{indent: false, logLevel},
			`${chalk.blueBright(assetPath)} Downloaded asset`,
		);
	}

	if (missingDependencies.length > 0) {
		Log.info(
			{indent: false, logLevel},
			`Installed ${missingDependencies.map(formatDependency).join(', ')}`,
		);
	}

	Log.info(
		{indent: false, logLevel},
		chalk.green(
			`Installed ${element.displayName} into the composition "${compositionId}".`,
		),
	);
};
