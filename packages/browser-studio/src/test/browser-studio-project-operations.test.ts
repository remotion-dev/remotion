import {expect, test} from 'bun:test';
import {staticFileRef, type ElementDragData} from '@remotion/studio-protocol';
import type {EventSourceEvent} from '@remotion/studio-shared';
import {createBrowserStudioOperations} from '../browser-studio-operations';
import {
	areBrowserStudioProjectsEqual,
	createBrowserStudioPublicFileManager,
} from '../browser-studio-project-controller';
import {createBlankTemplateProject} from '../templates/blank';
import type {VirtualProject} from '../types';

test('previews and creates a Canvas Capture with both files in undo history', async () => {
	const initialProject = createBlankTemplateProject();
	let project = initialProject;
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: null,
	});
	const request: Parameters<typeof operations.applyCodemod>[0] = {
		codemod: {
			type: 'new-composition',
			newId: 'Capture',
			componentName: 'Capture',
			componentImportPath: './Capture',
			folderName: null,
			parentName: null,
			newDurationInFrames: 90,
			newFps: 30,
			newHeight: 720,
			newWidth: 1280,
			canvasCapture: {
				videoFileName: 'capture.mp4',
				videoHeight: 1080,
				videoWidth: 1920,
				keyframeFps: 30,
				data: {
					captureMetadata: {density: 2},
					mouseMovements: [
						{timeInSeconds: 0, canvasX: 10, canvasY: 20, cursor: 'pointer'},
					],
					pointerClicks: [],
				},
			},
		},
		dryRun: true,
		undoRedoNavigation: null,
		symbolicatedStack: null,
	};
	const preview = await operations.applyCodemod(request);
	if (!preview.success) {
		throw new Error(preview.reason);
	}

	expect(preview.diff.additions).toBeGreaterThan(0);
	expect(project).toBe(initialProject);
	expect(await operations.applyCodemod({...request, dryRun: false})).toEqual(
		preview,
	);
	expect(project.files['/project/src/Root.tsx']).toContain('<Capture />');
	expect(project.files['/project/src/Root.tsx']).toMatch(
		/from ["']\.\/Capture["']/,
	);
	const generated = project.files['/project/src/Capture.tsx'];
	expect(generated).toContain("id={'Capture'}");
	expect(generated).toContain("staticFile('capture.mp4')");
	expect(generated).toContain('<MacOSCursor');
	const createdProject = project;
	expect((await operations.undo()).success).toBe(true);
	expect(project.files).toEqual(initialProject.files);
	expect((await operations.redo()).success).toBe(true);
	expect(project.files).toEqual(createdProject.files);
	expect(
		await operations.applyCodemod({...request, dryRun: false}),
	).toMatchObject({
		success: false,
		reason: expect.stringContaining('already exists'),
	});
	expect(project.files).toEqual(createdProject.files);
});

test('mutates virtual files, emits events, and preserves undo and redo history', async () => {
	const initialProject = createBlankTemplateProject();
	let project: VirtualProject = {
		...initialProject,
		publicFiles: {'existing.txt': 'existing'},
	};
	const revokedUrls: string[] = [];
	let nextObjectUrl = 0;
	const publicFileManager = createBrowserStudioPublicFileManager({
		createObjectUrl: () => `blob:virtual-${++nextObjectUrl}`,
		revokeObjectUrl: (url) => revokedUrls.push(url),
	});
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: publicFileManager.getStaticFiles,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: null,
	});
	const events: EventSourceEvent[] = [];
	const contentsAtMutation: string[] = [];
	const unsubscribe = operations.subscribeToEvent((event) => {
		events.push(event);
		if (event.type === 'sequence-node-paths-remapped') {
			contentsAtMutation.push(project.files['/project/src/Composition.tsx']);
		}
	});
	await new Promise((resolve) => setTimeout(resolve, 0));

	expect(events.slice(0, 2).map((event) => event.type)).toEqual([
		'init',
		'new-public-folder',
	]);
	expect(
		await operations.findInFile({
			fileName: 'webpack://remotion/./src/Composition.tsx',
			lineNumber: 1,
			columnNumber: 1,
			search: 'durationInFrames',
		}),
	).toEqual({lineNumber: 14, columnNumber: 7});

	const insertResult = await operations.insertSolid({
		compositionFile: '/project/src/Composition.tsx',
		compositionId: 'MyComp',
		element: {
			type: 'solid',
			width: 1280,
			height: 720,
			position: null,
		},
		from: null,
	});
	if (!insertResult.success) {
		throw new Error(insertResult.reason);
	}

	expect(
		events.findLast((event) => event.type === 'sequence-node-paths-remapped'),
	).toEqual({
		type: 'sequence-node-paths-remapped',
		mutation: insertResult.nodePathMutation,
	});
	expect(contentsAtMutation).toEqual([
		initialProject.files['/project/src/Composition.tsx'],
	]);
	expect(project.files['/project/src/Composition.tsx']).toContain('<Solid');
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'width={1280}',
	);

	const {redo, undo} = operations;
	const undoResult = await undo();
	expect(undoResult.success).toBe(true);
	if (!undoResult.success || undoResult.nodePathMutation === null) {
		throw new Error('Expected undo to remap node paths');
	}

	expect(undoResult.nodePathMutation.files).toEqual(
		insertResult.nodePathMutation.files.map((file) => ({
			absolutePath: file.absolutePath,
			remappings: file.remappings.map((remapping) => ({
				oldNodePath: remapping.newNodePath,
				newNodePath: remapping.oldNodePath,
			})),
		})),
	);
	expect(project.files['/project/src/Composition.tsx']).toBe(
		initialProject.files['/project/src/Composition.tsx'],
	);
	const redoResult = await redo();
	expect(redoResult.success).toBe(true);
	if (!redoResult.success || redoResult.nodePathMutation === null) {
		throw new Error('Expected redo to remap node paths');
	}

	expect(redoResult.nodePathMutation.files).toEqual(
		insertResult.nodePathMutation.files,
	);
	expect(project.files['/project/src/Composition.tsx']).toContain('<Solid');
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'width={1280}',
	);
	if (insertResult.insertedNodePath === null) {
		throw new Error('Expected the inserted Solid to have a node path');
	}

	const deleteResult = await operations.deleteJsxNodes({
		nodes: [
			{
				fileName: '/project/src/Composition.tsx',
				nodePath: insertResult.insertedNodePath.nodePath,
			},
		],
	});
	if (!deleteResult.success) {
		throw new Error(deleteResult.reason);
	}

	expect(project.files['/project/src/Composition.tsx']).not.toContain('<Solid');
	expect(deleteResult.nodePathMutation.files).toEqual([
		{
			absolutePath: '/project/src/Composition.tsx',
			remappings: expect.arrayContaining([
				{
					oldNodePath: insertResult.insertedNodePath.nodePath,
					newNodePath: null,
				},
			]),
		},
	]);
	const undoDeleteResult = await undo();
	expect(undoDeleteResult.success).toBe(true);
	expect(project.files['/project/src/Composition.tsx']).toContain('<Solid');

	const {writeStaticFile} = operations;
	await writeStaticFile({
		contents: new Uint8Array([0, 127, 128, 255]).buffer,
		filePath: '/nested/upload.bin',
	});
	await new Promise((resolve) => setTimeout(resolve, 0));
	expect(project.publicFiles?.['nested/upload.bin']).toEqual(
		new Uint8Array([0, 127, 128, 255]),
	);

	const publicFolderEvents = events.filter(
		(event): event is Extract<EventSourceEvent, {type: 'new-public-folder'}> =>
			event.type === 'new-public-folder',
	);
	const uploadedFile = publicFolderEvents
		.at(-1)
		?.files.find((file) => file.name === 'nested/upload.bin');
	expect(uploadedFile).toMatchObject({
		lastModified: 1,
		name: 'nested/upload.bin',
		sizeInBytes: 4,
		src: 'blob:virtual-2',
	});

	const {renameStaticFile} = operations;
	await renameStaticFile({
		oldRelativePath: 'nested/upload.bin',
		newRelativePath: 'renamed.bin',
	});
	expect(project.publicFiles?.['nested/upload.bin']).toBeUndefined();
	expect(project.publicFiles?.['renamed.bin']).toEqual(
		new Uint8Array([0, 127, 128, 255]),
	);

	const {deleteStaticFile} = operations;
	expect(await deleteStaticFile({relativePath: 'renamed.bin'})).toEqual({
		success: true,
		existed: true,
	});
	expect(project.publicFiles?.['renamed.bin']).toBeUndefined();

	expect(await undo()).toEqual({
		success: true,
		nodePathMutation: null,
		route: null,
	});
	expect(project.publicFiles?.['renamed.bin']).toEqual(
		new Uint8Array([0, 127, 128, 255]),
	);
	expect(await undo()).toEqual({
		success: true,
		nodePathMutation: null,
		route: null,
	});
	expect(project.publicFiles?.['nested/upload.bin']).toEqual(
		new Uint8Array([0, 127, 128, 255]),
	);

	expect(
		await operations.getFileSource(
			'webpack://remotion/./src/Composition.tsx?source',
		),
	).toContain('<Solid');

	const eventCount = events.length;
	unsubscribe();
	await undo();
	expect(events).toHaveLength(eventCount);
	publicFileManager.dispose();
	expect(revokedUrls).toContain('blob:virtual-2');
});

test('downloads CORS-enabled remote assets and rejects failed cross-origin fetches', async () => {
	const initialProject = createBlankTemplateProject();
	let project = initialProject;
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: null,
	});
	const originalFetch = globalThis.fetch;
	const requestedUrls: string[] = [];
	const gif = new Uint8Array([
		0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x20, 0x03, 0x58, 0x02,
	]);
	globalThis.fetch = Object.assign(
		(input: Parameters<typeof fetch>[0]) => {
			const url = input.toString();
			requestedUrls.push(url);
			if (url.includes('cors-blocked')) {
				return Promise.reject(new TypeError('Load failed'));
			}

			return Promise.resolve(
				new Response(gif, {
					headers: {'content-length': String(gif.byteLength)},
					status: 200,
				}),
			);
		},
		{preconnect: originalFetch.preconnect},
	);

	try {
		expect(
			await operations.downloadRemoteAsset({
				url: 'https://assets.example/path/remote-logo.png',
			}),
		).toEqual({
			assetPath: 'remote-logo.gif',
			created: true,
			element: {
				assetType: 'gif',
				dimensions: {height: 600, width: 800},
				durationInFrames: null,
				position: null,
				src: 'remote-logo.gif',
				srcType: 'static',
				type: 'asset',
			},
			sizeInBytes: gif.byteLength,
		});
		expect(project.publicFiles?.['remote-logo.gif']).toEqual(gif);

		expect(await operations.undo()).toEqual({
			nodePathMutation: null,
			route: null,
			success: true,
		});
		expect(project.publicFiles?.['remote-logo.gif']).toBeUndefined();
		expect(await operations.redo()).toEqual({
			nodePathMutation: null,
			route: null,
			success: true,
		});
		expect(project.publicFiles?.['remote-logo.gif']).toEqual(gif);

		await expect(
			operations.downloadRemoteAsset({
				url: 'https://assets.example/cors-blocked.gif',
			}),
		).rejects.toThrow(
			'Could not fetch remote asset. The URL may not allow cross-origin requests (CORS): Load failed',
		);
		expect(project.publicFiles?.['cors-blocked.gif']).toBeUndefined();
		expect(requestedUrls).toEqual([
			'https://assets.example/path/remote-logo.png',
			'https://assets.example/cors-blocked.gif',
		]);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('previews and duplicates compositions as an undoable project mutation', async () => {
	const initialProject = createBlankTemplateProject();
	let project = initialProject;
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: null,
	});
	const request = {
		undoRedoNavigation: {
			undoRoute: '/MyComp',
			redoRoute: '/MyCompCopy',
		},
		codemod: {
			type: 'duplicate-composition' as const,
			idToDuplicate: 'MyComp',
			newDurationInFrames: 120,
			newFps: 24,
			newHeight: 1080,
			newId: 'MyCompCopy',
			newWidth: 1920,
			tag: 'Composition' as const,
		},
	};

	const preview = await operations.duplicateComposition({
		...request,
		dryRun: true,
		undoRedoNavigation: null,
	});
	expect(preview.success).toBe(true);
	if (!preview.success) {
		throw new Error(preview.reason);
	}

	expect(preview.diff.additions).toBeGreaterThan(0);
	expect(project).toBe(initialProject);

	const result = await operations.duplicateComposition({
		...request,
		dryRun: false,
	});
	expect(result).toEqual(preview);
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'id="MyCompCopy"',
	);
	expect(project.files['/project/src/Composition.tsx']).toContain('fps={24}');
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'width={1920}',
	);

	expect(await operations.undo()).toEqual({
		success: true,
		nodePathMutation: null,
		route: '/MyComp',
	});
	expect(project.files['/project/src/Composition.tsx']).toBe(
		initialProject.files['/project/src/Composition.tsx'],
	);
	expect(await operations.redo()).toEqual({
		success: true,
		nodePathMutation: null,
		route: '/MyCompCopy',
	});
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'id="MyCompCopy"',
	);
	expect((await operations.undo()).success).toBe(true);

	const failure = await operations.duplicateComposition({
		...request,
		codemod: {...request.codemod, idToDuplicate: 'Missing'},
		dryRun: false,
	});
	expect(failure).toMatchObject({
		success: false,
		reason: 'Could not find composition "Missing" to duplicate',
		stack: expect.any(String),
	});
	expect(project.files['/project/src/Composition.tsx']).toBe(
		initialProject.files['/project/src/Composition.tsx'],
	);

	const stillResult = await operations.duplicateComposition({
		...request,
		codemod: {...request.codemod, newId: 'MyStill', tag: 'Still'},
		dryRun: false,
	});
	expect(stillResult.success).toBe(true);
	const stillSource =
		project.files['/project/src/Composition.tsx'].match(
			/<Still[\s\S]*?\/>/,
		)?.[0];
	expect(stillSource).toContain('id="MyStill"');
	expect(stillSource).toContain('width={1920}');
	expect(stillSource).not.toContain('fps=');
	expect(stillSource).not.toContain('durationInFrames=');
});

test('imports an Element with pinned Remotion dependencies as one undoable mutation', async () => {
	const initialProject = createBlankTemplateProject();
	let project = initialProject;
	const resolvedDependencyNames: string[][] = [];
	const operations = createBrowserStudioOperations({
		dependencyVersions: {remotion: '4.0.999'},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: (dependencies) => {
			resolvedDependencyNames.push(
				dependencies.map((dependency) => dependency.name),
			);
			return Promise.resolve({
				'@remotion/shapes': '0.0.1',
				zod: '4.1.5',
			});
		},
	});
	const element = {
		assets: [{path: 'elements/lower-third.bin', type: 'base64', data: 'AAEC'}],
		dependencies: [
			{name: '@remotion/shapes', version: null},
			{name: 'zod', version: '4.1.5'},
		],
		dimensions: {width: 640, height: 180},
		displayName: 'Lower Third',
		durationInFrames: 90,
		initialProps: {
			label: 'Starter',
			logoSrc: staticFileRef('elements/lower-third.bin'),
		},
		installationMode: 'wrapped' as const,
		slug: 'titles/lower-third',
		sourceCode: `import {Rect} from '@remotion/shapes';
import {Img} from 'remotion';

export const LowerThird = ({logoSrc}: {logoSrc: string}) => <>
	<Rect width={640} height={180} />
	<Img name="Logo" src={logoSrc} />
</>;
`,
	} satisfies ElementDragData['element'];
	const preflight = await operations.prepareElementInstall({
		installationName: null,
		destination: {
			type: 'current-composition',
			compositionFile: '/project/src/Composition.tsx',
			compositionId: 'MyComp',
		},
		element,
	});
	if (!preflight.success) {
		throw new Error(preflight.reason);
	}

	expect(preflight.plan).toEqual({
		compositionFile: '/project/src/Composition.tsx',
		expectedFileState: {exists: false},
		filePath: 'src/lower-third.element.tsx',
	});
	const newCompositionPreflight = await operations.prepareElementInstall({
		installationName: null,
		destination: {
			type: 'new-composition',
			compositionFile: null,
		},
		element,
	});
	expect(newCompositionPreflight).toEqual({
		success: true,
		plan: {
			compositionFile: '/project/src/Root.tsx',
			expectedFileState: {exists: false},
			filePath: 'src/lower-third.element.tsx',
		},
	});

	const inserted = await operations.insertElement({
		installationName: null,
		compositionFile: '/project/src/Composition.tsx',
		compositionId: 'MyComp',
		element,
		expectedFileState: preflight.plan.expectedFileState,
		from: 12,
		overwriteExisting: false,
		position: {x: 24, y: 48},
		undoRedoNavigation: null,
		newComposition: null,
	});

	if (!inserted.success) {
		throw new Error(
			inserted.type === 'error' ? inserted.reason : 'Unexpected file conflict',
		);
	}

	expect(resolvedDependencyNames).toEqual([['@remotion/shapes', 'zod']]);
	const installedElementSource =
		project.files['/project/src/lower-third.element.tsx'];
	expect(installedElementSource).toBe(element.sourceCode);
	expect(project.files['/project/src/Composition.tsx']).toMatch(
		/logoSrc=\{staticFile\(["']elements\/lower-third\.bin["']\)\}/,
	);
	expect(project.publicFiles?.['elements/lower-third.bin']).toEqual(
		new Uint8Array([0, 1, 2]),
	);
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'import { LowerThird } from "./lower-third.element";',
	);
	expect(project.files['/project/src/Composition.tsx']).toContain('<Sequence');
	expect(project.files['/project/src/Composition.tsx']).toContain('from={12}');
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'name="Lower Third"',
	);
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'label="Starter"',
	);
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'translate: "24px 48px"',
	);
	const packageJson = JSON.parse(project.files['/project/package.json']) as {
		dependencies: Record<string, string>;
	};
	expect(packageJson.dependencies['@remotion/shapes']).toBe('4.0.999');
	expect(packageJson.dependencies.zod).toBe('4.1.5');

	expect((await operations.undo()).success).toBe(true);
	expect(project.files['/project/src/Composition.tsx']).toBe(
		initialProject.files['/project/src/Composition.tsx'],
	);
	expect(project.files['/project/src/lower-third.element.tsx']).toBeUndefined();
	expect(project.files['/project/package.json']).toBe(
		initialProject.files['/project/package.json'],
	);
	expect((await operations.redo()).success).toBe(true);
	expect(project.files['/project/src/lower-third.element.tsx']).toBe(
		installedElementSource,
	);

	const installRequest = {
		installationName: null,
		compositionFile: '/project/src/Composition.tsx',
		compositionId: 'MyComp',
		element,
		expectedFileState: null,
		from: null,
		overwriteExisting: false,
		position: null,
		undoRedoNavigation: null,
		newComposition: null,
	};
	expect(await operations.insertElement(installRequest)).toMatchObject({
		success: false,
		type: 'file-conflict',
		conflict: {incomingSource: installedElementSource},
	});
	const customizedSource = `${installedElementSource}\n// Customized\n`;
	project = {
		...project,
		files: {
			...project.files,
			'/project/src/lower-third.element.tsx': customizedSource,
		},
	};
	expect(
		(
			await operations.insertElement({
				...installRequest,
				installationName: 'speaker-name',
			})
		).success,
	).toBe(true);
	expect(project.files['/project/src/speaker-name.element.tsx']).toBe(
		installedElementSource,
	);
	expect(project.files['/project/src/lower-third.element.tsx']).toBe(
		customizedSource,
	);
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'LowerThird as LowerThird2',
	);
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'<LowerThird2',
	);
	expect(
		(
			await operations.insertElement({
				...installRequest,
				overwriteExisting: true,
			})
		).success,
	).toBe(true);
	expect(project.files['/project/src/lower-third.element.tsx']).toBe(
		installedElementSource,
	);
	expect((await operations.undo()).success).toBe(true);
	expect(project.files['/project/src/lower-third.element.tsx']).toBe(
		customizedSource,
	);
	expect(project.files['/project/src/speaker-name.element.tsx']).toBe(
		installedElementSource,
	);
});

const makeElementAssetFixture = () => {
	let project = createBlankTemplateProject();
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: null,
	});
	return {
		getProject: () => project,
		operations,
		install: (
			assets: ElementDragData['element']['assets'],
			installationName: string | null,
		) =>
			operations.insertElement({
				installationName,
				compositionFile: '/project/src/Composition.tsx',
				compositionId: 'MyComp',
				element: {
					assets,
					dependencies: [],
					dimensions: null,
					displayName: 'Asset Element',
					durationInFrames: 30,
					initialProps: null,
					installationMode: 'wrapped',
					slug: 'asset-element',
					sourceCode: 'export const AssetElement = () => <div />;',
				},
				expectedFileState: null,
				from: null,
				overwriteExisting: false,
				position: null,
				undoRedoNavigation: null,
				newComposition: null,
			}),
	};
};

test('retains installed assets across earlier history while allowing explicit asset undo and redo', async () => {
	const {getProject, install, operations} = makeElementAssetFixture();
	const originalSource = getProject().files['/project/src/Composition.tsx'];
	await operations.writeStaticFile({
		filePath: 'upload.txt',
		contents: 'Uploaded',
	});
	for (const [name, assetPath] of [
		['first', 'first.bin'],
		['second', '__proto__'],
	]) {
		expect(
			(await install([{path: assetPath, type: 'base64', data: 'AAEC'}], name))
				.success,
		).toBe(true);
	}

	const installedAssets = {
		'first.bin': new Uint8Array([0, 1, 2]),
		['__proto__']: new Uint8Array([0, 1, 2]),
	};
	for (let i = 0; i < 3; i++) {
		expect((await operations.undo()).success).toBe(true);
	}

	expect(getProject().files['/project/src/Composition.tsx']).toBe(
		originalSource,
	);
	expect(getProject().publicFiles).toEqual(installedAssets);
	for (let i = 0; i < 3; i++) {
		expect((await operations.redo()).success).toBe(true);
	}

	expect(getProject().publicFiles).toEqual({
		...installedAssets,
		'upload.txt': 'Uploaded',
	});
	expect(getProject().files['/project/src/Composition.tsx']).toContain(
		'<AssetElement2',
	);
	const events: EventSourceEvent[] = [];
	const unsubscribe = operations.subscribeToEvent((event) =>
		events.push(event),
	);
	await new Promise((resolve) => setTimeout(resolve, 0));
	unsubscribe();
	expect(
		events.findLast((event) => event.type === 'new-public-folder'),
	).toMatchObject({
		files: expect.arrayContaining([
			expect.objectContaining({
				name: '__proto__',
				sizeInBytes: 3,
				src: '/__proto__',
			}),
		]),
	});

	await operations.deleteStaticFile({relativePath: '__proto__'});
	expect(Object.hasOwn(getProject().publicFiles ?? {}, '__proto__')).toBe(
		false,
	);
	expect((await operations.undo()).success).toBe(true);
	expect(Object.entries(getProject().publicFiles ?? {})).toContainEqual([
		'__proto__',
		new Uint8Array([0, 1, 2]),
	]);
	expect((await operations.redo()).success).toBe(true);
	expect(Object.hasOwn(getProject().publicFiles ?? {}, '__proto__')).toBe(
		false,
	);
});

test.each([
	['folder', 'folder/asset.bin'],
	['folder/asset.bin', 'folder'],
	['Asset.bin', 'asset.bin'],
])(
	'rejects installation of %s conflicting with public path %s',
	async (existingPath, assetPath) => {
		const {getProject, install, operations} = makeElementAssetFixture();
		await operations.writeStaticFile({
			filePath: existingPath,
			contents: 'Existing',
		});
		const before = getProject();
		expect(
			await install([{path: assetPath, type: 'base64', data: 'AAEC'}], null),
		).toMatchObject({success: false, type: 'error'});
		expect(getProject()).toBe(before);
	},
);

test('installs an Element into a new composition as one undoable mutation', async () => {
	const initialProject = createBlankTemplateProject();
	let project = initialProject;
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: null,
	});
	const element = {
		assets: [],
		dependencies: [],
		dimensions: {width: 640, height: 180},
		displayName: 'Browser Element',
		durationInFrames: 90,
		initialProps: null,
		installationMode: 'wrapped' as const,
		slug: 'browser-element',
		sourceCode: 'export const BrowserElement = () => <div />;\n',
	} satisfies ElementDragData['element'];
	const preflight = await operations.prepareElementInstall({
		installationName: null,
		destination: {type: 'new-composition', compositionFile: null},
		element,
	});
	if (!preflight.success) {
		throw new Error(preflight.reason);
	}

	const result = await operations.insertElement({
		installationName: null,
		compositionFile: preflight.plan.compositionFile,
		compositionId: 'ElementScene',
		element,
		expectedFileState: preflight.plan.expectedFileState,
		from: null,
		overwriteExisting: false,
		position: null,
		undoRedoNavigation: {
			undoRoute: '/MyComp',
			redoRoute: '/ElementScene',
		},
		newComposition: {
			codemod: {
				type: 'new-composition',
				newId: 'ElementScene',
				componentName: 'ElementScene',
				componentImportPath: './ElementScene',
				folderName: null,
				parentName: null,
				newHeight: 720,
				newWidth: 1280,
				newFps: 30,
				newDurationInFrames: 90,
				canvasCapture: null,
			},
			symbolicatedStack: null,
		},
	});
	if (!result.success) {
		throw new Error(
			result.type === 'error' ? result.reason : 'Unexpected file conflict',
		);
	}

	expect(project.files['/project/src/Root.tsx']).toContain('id="ElementScene"');
	expect(project.files['/project/src/ElementScene.tsx']).toContain(
		'<BrowserElement',
	);
	expect(project.files['/project/src/browser-element.element.tsx']).toBe(
		element.sourceCode,
	);
	const installedProject = project;

	expect(await operations.undo()).toMatchObject({
		success: true,
		route: '/MyComp',
	});
	expect(project.files['/project/src/Root.tsx']).toBe(
		initialProject.files['/project/src/Root.tsx'],
	);
	expect(project.files['/project/src/ElementScene.tsx']).toBeUndefined();
	expect(
		project.files['/project/src/browser-element.element.tsx'],
	).toBeUndefined();
	expect(await operations.undo()).toEqual({
		success: false,
		reason: 'Nothing to undo',
	});

	expect(await operations.redo()).toMatchObject({
		success: true,
		route: '/ElementScene',
	});
	expect(areBrowserStudioProjectsEqual(project, installedProject)).toBe(true);
});

test('installs component-owned Element timing and initial props', async () => {
	let project = createBlankTemplateProject();
	project.files['/project/src/Composition.tsx'] =
		`import {staticFile as assetFile} from 'remotion';\n${project.files['/project/src/Composition.tsx']}`;
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: null,
	});
	const element = {
		assets: [{path: 'captions/sound.bin', type: 'base64', data: 'AAEC'}],
		dependencies: [],
		dimensions: {width: 640, height: 180},
		displayName: 'Captions',
		durationInFrames: 90,
		initialProps: {
			captions: [
				{
					text: 'Starter',
					startMs: 0,
					endMs: 1000,
					sound: staticFileRef('captions/sound.bin'),
				},
			],
			style: {
				color: 'red',
				position: 'relative',
				translate: '1px 2px',
			},
			width: 640,
		},
		installationMode: 'component-owned-sequence' as const,
		slug: 'captions',
		sourceCode: 'export const Captions = () => <div />;\n',
	} satisfies ElementDragData['element'];
	const preflight = await operations.prepareElementInstall({
		installationName: null,
		destination: {
			type: 'current-composition',
			compositionFile: '/project/src/Composition.tsx',
			compositionId: 'MyComp',
		},
		element,
	});
	if (!preflight.success) {
		throw new Error(preflight.reason);
	}

	const inserted = await operations.insertElement({
		installationName: null,
		compositionFile: '/project/src/Composition.tsx',
		compositionId: 'MyComp',
		element,
		expectedFileState: preflight.plan.expectedFileState,
		from: 30,
		overwriteExisting: false,
		position: {x: 24, y: 48},
		undoRedoNavigation: null,
		newComposition: null,
	});
	if (!inserted.success) {
		throw new Error(
			inserted.type === 'error' ? inserted.reason : 'Unexpected file conflict',
		);
	}

	expect(project.files['/project/src/captions.element.tsx']).toBe(
		element.sourceCode,
	);
	const composition = project.files['/project/src/Composition.tsx'];
	expect(composition).not.toContain('<Sequence');
	expect(composition).toContain('<Captions');
	expect(composition).toContain('captions={[');
	expect(composition).toContain('sound: assetFile("captions/sound.bin")');
	expect(project.publicFiles?.['captions/sound.bin']).toEqual(
		new Uint8Array([0, 1, 2]),
	);
	expect(composition).toContain('text: "Starter"');
	expect(composition).toContain('width={640}');
	expect(composition).toContain('durationInFrames={90}');
	expect(composition).toContain('from={30}');
	expect(composition).toContain('name="Captions"');
	expect(composition).toContain('color: "red"');
	expect(composition).toContain('position: "absolute"');
	expect(composition).toContain('translate: "24px 48px"');
	expect(composition).not.toContain('translate: "1px 2px"');
	expect(composition.match(/\bstyle=/g)).toHaveLength(1);
});

test('rejects contradictory component-owned Element initial props', async () => {
	const initialProject = createBlankTemplateProject();
	let project = initialProject;
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: null,
	});
	const invalidCases: Array<{
		initialProps: ElementDragData['element']['initialProps'];
		reason: string;
	}> = [
		{
			initialProps: {from: 10},
			reason:
				'Component-owned Element initial props must not override from, durationInFrames, or name',
		},
		{
			initialProps: {durationInFrames: 10},
			reason:
				'Component-owned Element initial props must not override from, durationInFrames, or name',
		},
		{
			initialProps: {name: 'Override'},
			reason:
				'Component-owned Element initial props must not override from, durationInFrames, or name',
		},
		{
			initialProps: {style: 'color: red'},
			reason: 'Component-owned Element initial style must be an object',
		},
	];

	for (const {initialProps, reason} of invalidCases) {
		const response = await operations.insertElement({
			installationName: null,
			compositionFile: '/project/src/Composition.tsx',
			compositionId: 'MyComp',
			element: {
				assets: [],
				dependencies: [],
				dimensions: {width: 640, height: 180},
				displayName: 'Captions',
				durationInFrames: 90,
				initialProps,
				installationMode: 'component-owned-sequence',
				slug: 'captions',
				sourceCode: 'export const Captions = () => <div />;\n',
			},
			expectedFileState: null,
			from: 30,
			overwriteExisting: false,
			position: {x: 24, y: 48},
			undoRedoNavigation: null,
			newComposition: null,
		});

		expect(response).toMatchObject({
			success: false,
			type: 'error',
			reason,
		});
		expect(project).toBe(initialProject);
	}
});

test('installs packages as an undoable project mutation and reports structured failures', async () => {
	const initialProject = createBlankTemplateProject();
	let project = initialProject;
	const resolvedDependencies: string[][] = [];
	const operations = createBrowserStudioOperations({
		dependencyVersions: {remotion: '4.0.999'},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: (dependencies) => {
			resolvedDependencies.push(
				dependencies.map((dependency) => dependency.name),
			);
			return Promise.resolve({zod: '4.1.5'});
		},
	});
	const result = await operations.packageInstallation.installPackages({
		dependencies: [
			{name: '@remotion/google-fonts', version: null},
			{name: 'zod', version: '4.1.5'},
		],
	});
	expect(result).toEqual({success: true});
	expect(resolvedDependencies).toEqual([['@remotion/google-fonts', 'zod']]);
	const packageJson = JSON.parse(project.files['/project/package.json']) as {
		dependencies: Record<string, string>;
	};
	expect(packageJson.dependencies['@remotion/google-fonts']).toBe('4.0.999');
	expect(packageJson.dependencies.zod).toBe('4.1.5');

	expect(await operations.undo()).toEqual({
		success: true,
		nodePathMutation: null,
		route: null,
	});
	expect(project.files['/project/package.json']).toBe(
		initialProject.files['/project/package.json'],
	);
	expect(await operations.redo()).toEqual({
		success: true,
		nodePathMutation: null,
		route: null,
	});
	expect(project.files['/project/package.json']).toContain(
		'"@remotion/google-fonts": "4.0.999"',
	);

	const unresolved = await operations.packageInstallation.installPackages({
		dependencies: [{name: 'unresolvable', version: null}],
	});
	expect(unresolved).toMatchObject({
		success: false,
		reason: 'Could not resolve unresolvable',
		stack: expect.any(String),
	});
	const empty = await operations.packageInstallation.installPackages({
		dependencies: [],
	});
	expect(empty).toMatchObject({
		success: false,
		reason: 'No packages were specified',
		stack: expect.any(String),
	});
});

test('inserts generic elements with pinned Remotion dependencies', async () => {
	let project = createBlankTemplateProject();
	const operations = createBrowserStudioOperations({
		dependencyVersions: {remotion: '4.0.999'},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: null,
	});
	const result = await operations.insertJsxElement({
		compositionFile: '/project/src/Composition.tsx',
		compositionId: 'MyComp',
		element: {
			assetType: 'video',
			dimensions: {height: 1080, width: 1920},
			durationInFrames: 90,
			position: null,
			src: 'clip.mp4',
			srcType: 'static',
			type: 'asset',
		},
		from: 12,
	});
	if (!result.success) {
		throw new Error(result.reason);
	}

	expect(project.files['/project/src/Composition.tsx']).toContain(
		'from "@remotion/media"',
	);
	expect(project.files['/project/src/Composition.tsx']).toContain('<Video');
	const packageJson = JSON.parse(project.files['/project/package.json']) as {
		dependencies: Record<string, string>;
	};
	expect(packageJson.dependencies['@remotion/media']).toBe('4.0.999');
});

test('rejects inline SVG importing in Browser Studio', async () => {
	const project = createBlankTemplateProject();
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: () => {
			throw new Error('SVG insertion must not mutate the project');
		},
		resolveDependencies: null,
	});
	const result = await operations.insertJsxElement({
		compositionFile: '/project/src/Composition.tsx',
		compositionId: 'MyComp',
		element: {
			markup: '<svg viewBox="0 0 10 10" />',
			position: null,
			type: 'svg',
		},
		from: null,
	});

	expect(result).toMatchObject({
		reason: 'Importing SVG markup is not supported in Browser Studio',
		success: false,
	});
});

test('replays an HMR event emitted before the Studio subscribes', () => {
	const project = createBlankTemplateProject();
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: () => undefined,
		resolveDependencies: null,
	});
	const hmrEvent = {
		type: 'hmr',
		hmrEvent: {
			action: 'built',
			errors: [],
			hash: 'new-hash',
			modules: {'/project/src/Composition.tsx': 'Composition.tsx'},
			name: '',
			time: 12,
			warnings: [],
		},
	} satisfies EventSourceEvent;

	operations.emitEvent(hmrEvent);
	const events: EventSourceEvent[] = [];
	operations.subscribeToEvent((event) => events.push(event));

	expect(events.at(-1)).toEqual(hmrEvent);
});

test('rejects unsafe public paths and conflicting renames', async () => {
	let project: VirtualProject = {
		...createBlankTemplateProject(),
		publicFiles: {'existing.txt': 'existing'},
	};
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		initialElement: null,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: null,
	});
	const {renameStaticFile, writeStaticFile} = operations;

	await expect(
		writeStaticFile({contents: 'unsafe', filePath: '../outside.txt'}),
	).rejects.toThrow('Invalid public file path');
	await writeStaticFile({contents: 'new', filePath: 'new.txt'});
	await expect(
		renameStaticFile({
			oldRelativePath: 'new.txt',
			newRelativePath: 'existing.txt',
		}),
	).rejects.toThrow('already exists');

	operations.resetHistory();
	expect(await operations.undo()).toEqual({
		success: false,
		reason: 'Nothing to undo',
	});
});

test('refreshes object URLs if a supplied byte array is mutated', async () => {
	const contents = new Uint8Array([1, 2, 3]);
	const revokedUrls: string[] = [];
	let nextObjectUrl = 0;
	const publicFileManager = createBrowserStudioPublicFileManager({
		createObjectUrl: () => `blob:mutable-${++nextObjectUrl}`,
		revokeObjectUrl: (url) => revokedUrls.push(url),
	});
	const project: VirtualProject = {
		...createBlankTemplateProject(),
		publicFiles: {'mutable.bin': contents},
	};

	expect(
		(
			await publicFileManager.getStaticFiles({
				lastModifiedByPath: null,
				project,
			})
		)[0].src,
	).toBe('blob:mutable-1');
	contents[0] = 4;
	expect(
		(
			await publicFileManager.getStaticFiles({
				lastModifiedByPath: null,
				project,
			})
		)[0].src,
	).toBe('blob:mutable-2');
	expect(revokedUrls).toEqual(['blob:mutable-1']);

	publicFileManager.dispose();
});

test('uses the platform object URL implementation when overrides are null', async () => {
	const publicFileManager = createBrowserStudioPublicFileManager({
		createObjectUrl: null,
		revokeObjectUrl: null,
	});
	const project: VirtualProject = {
		...createBlankTemplateProject(),
		publicFiles: {'default.txt': 'contents'},
	};

	const [file] = await publicFileManager.getStaticFiles({
		lastModifiedByPath: null,
		project,
	});
	if (!file) {
		throw new Error('Expected the virtual static file');
	}

	expect(file.src.startsWith('blob:')).toBe(true);
	publicFileManager.dispose();
});

test('compares deep-cloned virtual projects without serializing binary assets', () => {
	const left: VirtualProject = {
		...createBlankTemplateProject(),
		publicFiles: {'asset.bin': new Uint8Array([0, 127, 128, 255])},
	};
	const equalClone: VirtualProject = {
		...left,
		files: {...left.files},
		publicFiles: {'asset.bin': new Uint8Array([0, 127, 128, 255])},
	};
	const changedClone: VirtualProject = {
		...equalClone,
		publicFiles: {'asset.bin': new Uint8Array([0, 127, 128, 254])},
	};

	expect(areBrowserStudioProjectsEqual(left, equalClone)).toBe(true);
	expect(areBrowserStudioProjectsEqual(left, changedClone)).toBe(false);
});
