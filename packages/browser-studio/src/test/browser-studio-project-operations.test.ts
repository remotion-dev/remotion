import {expect, test} from 'bun:test';
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
	});
	const events: EventSourceEvent[] = [];
	const unsubscribe = operations.subscribeToEvent((event) =>
		events.push(event),
	);

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
	expect(insertResult).toEqual({success: true});
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'<Solid width={1280}',
	);

	const {redo, undo} = operations;
	expect(await undo()).toEqual({success: true});
	expect(project.files['/project/src/Composition.tsx']).toBe(
		initialProject.files['/project/src/Composition.tsx'],
	);
	expect(await redo()).toEqual({success: true});
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'<Solid width={1280}',
	);

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

	expect(await undo()).toEqual({success: true});
	expect(project.publicFiles?.['renamed.bin']).toEqual(
		new Uint8Array([0, 127, 128, 255]),
	);
	expect(await undo()).toEqual({success: true});
	expect(project.publicFiles?.['nested/upload.bin']).toEqual(
		new Uint8Array([0, 127, 128, 255]),
	);

	expect(
		await operations.getFileSource(
			'webpack://remotion/./src/Composition.tsx?source',
		),
	).toContain('<Solid width={1280}');

	const eventCount = events.length;
	unsubscribe();
	await undo();
	expect(events).toHaveLength(eventCount);
	publicFileManager.dispose();
	expect(revokedUrls).toContain('blob:virtual-2');
});

test('replays an HMR event emitted before the Studio subscribes', () => {
	const project = createBlankTemplateProject();
	const operations = createBrowserStudioOperations({
		dependencyVersions: {},
		getStaticFiles: null,
		getProject: () => project,
		onProjectChange: () => undefined,
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
