import {expect, test} from 'bun:test';
import type {ElementDragData} from '@remotion/studio-protocol';
import type {EventSourceEvent} from '@remotion/studio-shared';
import {createBrowserStudioOperations} from '../browser-studio-operations';
import {
	areBrowserStudioProjectsEqual,
	createBrowserStudioPublicFileManager,
} from '../browser-studio-project-controller';
import {createBlankTemplateProject} from '../templates/blank';
import type {VirtualProject} from '../types';

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
		insertResult.nodePathMutation.files,
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

	const deleteResult = await operations.deleteJsxNode({
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
			restoredNodePaths: [],
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

	expect(await undo()).toEqual({success: true, nodePathMutation: null});
	expect(project.publicFiles?.['renamed.bin']).toEqual(
		new Uint8Array([0, 127, 128, 255]),
	);
	expect(await undo()).toEqual({success: true, nodePathMutation: null});
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

test('previews and duplicates compositions as an undoable project mutation', async () => {
	const initialProject = createBlankTemplateProject();
	let project = initialProject;
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
		resolveDependencies: null,
	});
	const request = {
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
	});
	expect(project.files['/project/src/Composition.tsx']).toBe(
		initialProject.files['/project/src/Composition.tsx'],
	);

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
});

test('imports an Element with pinned Remotion dependencies as one undoable mutation', async () => {
	const initialProject = createBlankTemplateProject();
	let project = initialProject;
	const resolvedDependencyNames: string[][] = [];
	const operations = createBrowserStudioOperations({
		dependencyVersions: {remotion: '4.0.999'},
		getStaticFiles: null,
		getProject: () => project,
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
		dependencies: [
			{name: '@remotion/shapes', version: null},
			{name: 'zod', version: '4.1.5'},
		],
		dimensions: {width: 640, height: 180},
		displayName: 'Lower Third',
		durationInFrames: 90,
		installationMode: 'wrapped' as const,
		slug: 'titles/lower-third',
		sourceCode: `import {Rect} from '@remotion/shapes';

export const LowerThird = () => <Rect width={640} height={180} />;
`,
	} satisfies ElementDragData['element'];
	const preflight = await operations.prepareElementInstall({
		compositionFile: '/project/src/Composition.tsx',
		compositionId: 'MyComp',
		element,
	});
	if (!preflight.success) {
		throw new Error(preflight.reason);
	}

	expect(preflight.plan).toEqual({
		expectedFileState: {exists: false},
		filePath: 'src/lower-third.element.tsx',
	});
	const inserted = await operations.insertElement({
		compositionFile: '/project/src/Composition.tsx',
		compositionId: 'MyComp',
		element,
		expectedFileState: preflight.plan.expectedFileState,
		from: 12,
		overwriteExisting: false,
		position: {x: 24, y: 48},
	});
	if (!inserted.success) {
		throw new Error(
			inserted.type === 'error' ? inserted.reason : 'Unexpected file conflict',
		);
	}

	expect(resolvedDependencyNames).toEqual([['@remotion/shapes', 'zod']]);
	expect(project.files['/project/src/lower-third.element.tsx']).toBe(
		element.sourceCode,
	);
	expect(project.files['/project/src/Composition.tsx']).toContain(
		"import {LowerThird} from './lower-third.element';",
	);
	expect(project.files['/project/src/Composition.tsx']).toContain('<Sequence');
	expect(project.files['/project/src/Composition.tsx']).toContain('from={12}');
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'name="Lower Third"',
	);
	expect(project.files['/project/src/Composition.tsx']).toContain(
		"translate: '24px 48px'",
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
		element.sourceCode,
	);
});

test('inserts generic elements with pinned Remotion dependencies', async () => {
	let project = createBlankTemplateProject();
	const operations = createBrowserStudioOperations({
		dependencyVersions: {remotion: '4.0.999'},
		getStaticFiles: null,
		getProject: () => project,
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
		"from '@remotion/media'",
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

test('refreshes object URLs if a supplied byte array is mutated', () => {
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
		publicFileManager.getStaticFiles({lastModifiedByPath: null, project})[0]
			.src,
	).toBe('blob:mutable-1');
	contents[0] = 4;
	expect(
		publicFileManager.getStaticFiles({lastModifiedByPath: null, project})[0]
			.src,
	).toBe('blob:mutable-2');
	expect(revokedUrls).toEqual(['blob:mutable-1']);

	publicFileManager.dispose();
});

test('uses the platform object URL implementation when overrides are null', () => {
	const publicFileManager = createBrowserStudioPublicFileManager({
		createObjectUrl: null,
		revokeObjectUrl: null,
	});
	const project: VirtualProject = {
		...createBlankTemplateProject(),
		publicFiles: {'default.txt': 'contents'},
	};

	const [file] = publicFileManager.getStaticFiles({
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
