import {expect, test} from 'bun:test';
import type {EventSourceEvent} from '@remotion/studio-shared';
import {createBrowserStudioOperations} from '../browser-studio-operations';
import {createBrowserStudioPublicFileManager} from '../browser-studio-project-controller';
import {createBlankTemplateProject} from '../templates/blank';
import type {VirtualProject} from '../types';

const getRequiredOperation = <T>(operation: T | undefined, name: string): T => {
	if (!operation) {
		throw new Error(`Expected Browser Studio operation ${name}`);
	}

	return operation;
};

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
		getStaticFiles: publicFileManager.getStaticFiles,
		getProject: () => project,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
	});
	const events: EventSourceEvent[] = [];
	const unsubscribe = getRequiredOperation(
		operations.subscribeToEvent,
		'subscribeToEvent',
	)((event) => events.push(event));

	expect(events.slice(0, 2).map((event) => event.type)).toEqual([
		'init',
		'new-public-folder',
	]);
	expect(
		await getRequiredOperation(
			operations.findInFile,
			'findInFile',
		)({
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

	const undo = getRequiredOperation(operations.undo, 'undo');
	const redo = getRequiredOperation(operations.redo, 'redo');
	expect(await undo()).toEqual({success: true});
	expect(project.files['/project/src/Composition.tsx']).toBe(
		initialProject.files['/project/src/Composition.tsx'],
	);
	expect(await redo()).toEqual({success: true});
	expect(project.files['/project/src/Composition.tsx']).toContain(
		'<Solid width={1280}',
	);

	const writeStaticFile = getRequiredOperation(
		operations.writeStaticFile,
		'writeStaticFile',
	);
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

	const renameStaticFile = getRequiredOperation(
		operations.renameStaticFile,
		'renameStaticFile',
	);
	await renameStaticFile({
		oldRelativePath: 'nested/upload.bin',
		newRelativePath: 'renamed.bin',
	});
	expect(project.publicFiles?.['nested/upload.bin']).toBeUndefined();
	expect(project.publicFiles?.['renamed.bin']).toEqual(
		new Uint8Array([0, 127, 128, 255]),
	);

	const deleteStaticFile = getRequiredOperation(
		operations.deleteStaticFile,
		'deleteStaticFile',
	);
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
		await getRequiredOperation(
			operations.getFileSource,
			'getFileSource',
		)('webpack://remotion/./src/Composition.tsx?source'),
	).toContain('<Solid width={1280}');

	const eventCount = events.length;
	unsubscribe();
	await undo();
	expect(events).toHaveLength(eventCount);
	publicFileManager.dispose();
	expect(revokedUrls).toContain('blob:virtual-2');
});

test('rejects unsafe public paths and conflicting renames', async () => {
	let project: VirtualProject = {
		...createBlankTemplateProject(),
		publicFiles: {'existing.txt': 'existing'},
	};
	const operations = createBrowserStudioOperations({
		getProject: () => project,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
	});
	const writeStaticFile = getRequiredOperation(
		operations.writeStaticFile,
		'writeStaticFile',
	);
	const renameStaticFile = getRequiredOperation(
		operations.renameStaticFile,
		'renameStaticFile',
	);

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
	expect(await getRequiredOperation(operations.undo, 'undo')()).toEqual({
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

	expect(publicFileManager.getStaticFiles({project})[0].src).toBe(
		'blob:mutable-1',
	);
	contents[0] = 4;
	expect(publicFileManager.getStaticFiles({project})[0].src).toBe(
		'blob:mutable-2',
	);
	expect(revokedUrls).toEqual(['blob:mutable-1']);

	publicFileManager.dispose();
});
