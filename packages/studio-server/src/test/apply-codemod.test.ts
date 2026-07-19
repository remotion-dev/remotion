import {expect, spyOn, test} from 'bun:test';
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import type {RecastCodemod} from '@remotion/studio-shared';
import {parseAndApplyCodemod} from '../codemods/duplicate-composition';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {
	applyCodemodHandler,
	getCodemodLogMessage,
} from '../preview-server/routes/apply-codemod';
import {redoHandler} from '../preview-server/routes/redo';
import {undoHandler} from '../preview-server/routes/undo';
import {getRedoStack, getUndoStack} from '../preview-server/undo-stack';

const rootContents = `import React from 'react';
import {Composition} from 'remotion';

const Component = () => null;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="DeleteMe"
				component={Component}
				durationInFrames={120}
				fps={30}
				width={1280}
				height={720}
			/>
			<Composition
				id="KeepMe"
				component={Component}
				durationInFrames={120}
				fps={30}
				width={1280}
				height={720}
			/>
		</>
	);
};
`;

const folderRootContents = `import React from 'react';
import {Composition, Folder} from 'remotion';

const Component = () => null;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="Parent">
				<Folder name="Shared">
					<Composition
						id="NestedA"
						component={Component}
						durationInFrames={120}
						fps={30}
						width={1280}
						height={720}
					/>
				</Folder>
			</Folder>
			<Folder name="Other">
				<Folder name="Shared">
					<Composition
						id="NestedB"
						component={Component}
						durationInFrames={120}
						fps={30}
						width={1280}
						height={720}
					/>
				</Folder>
			</Folder>
		</>
	);
};
`;

const selfClosingFolderRootContents = `import React from 'react';
import {Composition, Folder} from 'remotion';

const Component = () => null;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="Empty" />
			<Composition
				id="KeepMe"
				component={Component}
				durationInFrames={120}
				fps={30}
				width={1280}
				height={720}
			/>
		</>
	);
};
`;

const attributeFolderRootContents = `import React from 'react';
import {Composition, Folder} from 'remotion';

const Component = () => null;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder
				name="Parent"
				preview={<Folder name="Shared" />}
			/>
			<Composition
				id="MoveMe"
				component={Component}
				durationInFrames={120}
				fps={30}
				width={1280}
				height={720}
			/>
		</>
	);
};
`;

const standaloneCompositionRootContents = `import React from 'react';
import {Composition} from 'remotion';

const Component = () => null;

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="Standalone"
			component={Component}
			durationInFrames={120}
			fps={30}
			width={1280}
			height={720}
		/>
	);
};
`;

const clearUndoRedoStacks = () => {
	(getUndoStack() as unknown as unknown[]).length = 0;
	(getRedoStack() as unknown as unknown[]).length = 0;
};

test('formats precise log messages for all codemods', () => {
	const testCases: {codemod: RecastCodemod; expected: string}[] = [
		{
			codemod: {
				type: 'new-composition',
				newId: 'FreshVideo',
				componentName: 'FreshVideo',
				componentImportPath: './FreshVideo',
				folderName: 'Shared',
				parentName: 'Parent',
				newDurationInFrames: 150,
				newFps: 30,
				newHeight: 1080,
				newWidth: 1920,
			},
			expected: 'Created composition "FreshVideo" in folder "Parent/Shared"',
		},
		{
			codemod: {
				type: 'duplicate-composition',
				idToDuplicate: 'Original',
				newId: 'Copy',
				newDurationInFrames: null,
				newFps: null,
				newHeight: null,
				newWidth: null,
				tag: 'Composition',
			},
			expected: 'Duplicated composition "Original" to "Copy"',
		},
		{
			codemod: {
				type: 'rename-composition',
				idToRename: 'Original',
				newId: 'Renamed',
			},
			expected: 'Renamed composition "Original" to "Renamed"',
		},
		{
			codemod: {
				type: 'update-composition-metadata',
				idToUpdate: 'Original',
				newDurationInFrames: null,
				newFps: null,
				newHeight: null,
				newWidth: 1920,
			},
			expected: 'Updated metadata of composition "Original"',
		},
		{
			codemod: {type: 'delete-composition', idToDelete: 'DeleteMe'},
			expected: 'Deleted composition "DeleteMe"',
		},
		{
			codemod: {
				type: 'move-composition-to-folder',
				idToMove: 'MoveMe',
				folderName: 'Shared',
				parentName: 'Parent',
			},
			expected: 'Moved composition "MoveMe" into folder "Parent/Shared"',
		},
		{
			codemod: {
				type: 'move-composition-to-folder',
				idToMove: 'MoveMe',
				folderName: null,
				parentName: null,
			},
			expected: 'Moved composition "MoveMe" to root',
		},
		{
			codemod: {
				type: 'rename-folder',
				folderName: 'Old',
				parentName: 'Parent',
				newName: 'New',
			},
			expected: 'Renamed folder "Parent/Old" to "Parent/New"',
		},
		{
			codemod: {
				type: 'new-folder',
				folderName: 'New',
				parentName: 'Parent',
			},
			expected: 'Created folder "Parent/New"',
		},
		{
			codemod: {
				type: 'delete-folder',
				folderName: 'DeleteMe',
				parentName: 'Parent',
			},
			expected: 'Deleted folder "Parent/DeleteMe"',
		},
		{
			codemod: {
				type: 'apply-visual-control',
				changes: [
					{
						id: 'opacity',
						newValueSerialized: '0.5',
						newValueIsUndefined: false,
						enumPaths: [],
					},
				],
			},
			expected: 'Updated visual control "opacity"',
		},
		{
			codemod: {
				type: 'apply-visual-control',
				changes: [
					{
						id: 'opacity',
						newValueSerialized: '0.5',
						newValueIsUndefined: false,
						enumPaths: [],
					},
					{
						id: 'scale',
						newValueSerialized: '2',
						newValueIsUndefined: false,
						enumPaths: [],
					},
				],
			},
			expected: 'Updated visual controls "opacity", "scale"',
		},
	];

	for (const {codemod, expected} of testCases) {
		expect(getCodemodLogMessage(codemod)).toBe(expected);
	}
});

const getHandlerOptions = <T>({
	input,
	entryPoint,
	remotionRoot,
	logLevel = 'error',
}: {
	input: T;
	entryPoint: string;
	remotionRoot: string;
	logLevel?: 'error' | 'info';
}) => ({
	input,
	entryPoint,
	remotionRoot,
	request: {} as never,
	response: {} as never,
	logLevel,
	methods: {
		removeJob: () => undefined,
		cancelJob: () => undefined,
		addJob: () => undefined,
	},
	publicDir: remotionRoot,
	binariesDirectory: null,
});

const runCompositionCodemodUndoRedoTest = async ({
	codemod,
	assertApplied,
	expectedUndoMessage,
	expectedLogMessage,
}: {
	codemod: RecastCodemod;
	assertApplied: (contents: string) => void;
	expectedUndoMessage: string;
	expectedLogMessage?: string;
}) => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-codemod-'));
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		sendEventToClient: () => undefined,
		sendEventToClientId: () => true,
		router: () => Promise.resolve(),
		closeConnections: () => Promise.resolve(),
		addNewClientListener: () => () => undefined,
	});
	const consoleSpy = expectedLogMessage
		? spyOn(console, 'log').mockImplementation(() => undefined)
		: null;

	try {
		clearUndoRedoStacks();
		const entryPoint = path.join(remotionRoot, 'Root.tsx');
		writeFileSync(entryPoint, rootContents);

		const applyResponse = await applyCodemodHandler(
			getHandlerOptions({
				input: {
					codemod,
					dryRun: false,
					symbolicatedStack: {
						originalFunctionName: null,
						originalFileName: 'Root.tsx',
						originalLineNumber: 9,
						originalColumnNumber: 4,
						originalScriptCode: null,
					},
				},
				entryPoint,
				remotionRoot,
				logLevel: expectedLogMessage ? 'info' : 'error',
			}),
		);

		expect(applyResponse.success).toBe(true);
		assertApplied(readFileSync(entryPoint, 'utf-8'));
		expect(getUndoStack().length).toBe(1);
		expect(getUndoStack()[0].description.undoMessage).toBe(expectedUndoMessage);
		expect(getRedoStack().length).toBe(0);
		if (expectedLogMessage) {
			const logOutput = consoleSpy?.mock.calls.flat().join(' ');
			expect(logOutput).toContain('Root.tsx:9');
			expect(logOutput).toContain(expectedLogMessage);
		}

		const undoResponse = await undoHandler(
			getHandlerOptions({input: {}, entryPoint, remotionRoot}),
		);
		expect(undoResponse.success).toBe(true);
		expect(readFileSync(entryPoint, 'utf-8')).toBe(rootContents);
		expect(getUndoStack().length).toBe(0);
		expect(getRedoStack().length).toBe(1);

		const redoResponse = await redoHandler(
			getHandlerOptions({input: {}, entryPoint, remotionRoot}),
		);
		expect(redoResponse.success).toBe(true);
		assertApplied(readFileSync(entryPoint, 'utf-8'));
		expect(getUndoStack().length).toBe(1);
		expect(getRedoStack().length).toBe(0);
	} finally {
		clearUndoRedoStacks();
		cleanupLiveEvents();
		cleanupFileWatcher();
		consoleSpy?.mockRestore();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
};

test('applyCodemodHandler pushes composition deletions to undo and redo stacks', async () => {
	await runCompositionCodemodUndoRedoTest({
		codemod: {type: 'delete-composition', idToDelete: 'DeleteMe'},
		assertApplied: (contents) => {
			expect(contents).not.toContain('id="DeleteMe"');
			expect(contents).toContain('id="KeepMe"');
		},
		expectedUndoMessage: '↩️  Deletion of composition "DeleteMe"',
	});
});

test('applyCodemodHandler logs composition renames and pushes them to the undo and redo stacks', async () => {
	await runCompositionCodemodUndoRedoTest({
		codemod: {
			type: 'rename-composition',
			idToRename: 'DeleteMe',
			newId: 'Renamed',
		},
		assertApplied: (contents) => {
			expect(contents).not.toContain('id="DeleteMe"');
			expect(contents).toContain('id="Renamed"');
			expect(contents).toContain('id="KeepMe"');
		},
		expectedUndoMessage: '↩️  Rename of composition "DeleteMe" to "Renamed"',
		expectedLogMessage: 'Renamed composition "DeleteMe" to "Renamed"',
	});
});

test('applyCodemodHandler pushes composition duplications to undo and redo stacks', async () => {
	await runCompositionCodemodUndoRedoTest({
		codemod: {
			type: 'duplicate-composition',
			idToDuplicate: 'DeleteMe',
			newId: 'Duplicated',
			newDurationInFrames: null,
			newFps: null,
			newHeight: null,
			newWidth: null,
			tag: 'Composition',
		},
		assertApplied: (contents) => {
			expect(contents).toContain('id="DeleteMe"');
			expect(contents).toContain('id="Duplicated"');
			expect(contents).toContain('id="KeepMe"');
		},
		expectedUndoMessage:
			'↩️  Duplication of composition "DeleteMe" to "Duplicated"',
	});
});

test('applyCodemodHandler pushes folder creations to undo and redo stacks', async () => {
	await runCompositionCodemodUndoRedoTest({
		codemod: {
			type: 'new-folder',
			folderName: 'FreshFolder',
			parentName: null,
		},
		assertApplied: (contents) => {
			expect(contents).toContain('<Folder name="FreshFolder" />');
			expect(contents).toContain('id="KeepMe"');
		},
		expectedUndoMessage: '↩️  Creation of folder "FreshFolder"',
	});
});

test('applyCodemodHandler pushes composition moves to undo and redo stacks', async () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-codemod-'));
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		sendEventToClient: () => undefined,
		sendEventToClientId: () => true,
		router: () => Promise.resolve(),
		closeConnections: () => Promise.resolve(),
		addNewClientListener: () => () => undefined,
	});

	try {
		clearUndoRedoStacks();
		const entryPoint = path.join(remotionRoot, 'Root.tsx');
		writeFileSync(entryPoint, folderRootContents);

		const applyResponse = await applyCodemodHandler(
			getHandlerOptions({
				input: {
					codemod: {
						type: 'move-composition-to-folder',
						idToMove: 'NestedA',
						folderName: 'Shared',
						parentName: 'Other',
					} satisfies RecastCodemod,
					dryRun: false,
					symbolicatedStack: {
						originalFunctionName: null,
						originalFileName: 'Root.tsx',
						originalLineNumber: 9,
						originalColumnNumber: 4,
						originalScriptCode: null,
					},
				},
				entryPoint,
				remotionRoot,
			}),
		);

		expect(applyResponse.success).toBe(true);
		const contents = readFileSync(entryPoint, 'utf-8');
		expect(contents.indexOf('id="NestedB"')).toBeLessThan(
			contents.indexOf('id="NestedA"'),
		);
		expect(getUndoStack()[0].description.undoMessage).toBe(
			'↩️  Move of composition "NestedA" into folder "Other/Shared"',
		);

		const undoResponse = await undoHandler(
			getHandlerOptions({input: {}, entryPoint, remotionRoot}),
		);
		expect(undoResponse.success).toBe(true);
		expect(readFileSync(entryPoint, 'utf-8')).toBe(folderRootContents);
	} finally {
		clearUndoRedoStacks();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});

test('applyCodemodHandler pushes composition moves to root to undo and redo stacks', async () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-codemod-'));
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		sendEventToClient: () => undefined,
		sendEventToClientId: () => true,
		router: () => Promise.resolve(),
		closeConnections: () => Promise.resolve(),
		addNewClientListener: () => () => undefined,
	});

	try {
		clearUndoRedoStacks();
		const entryPoint = path.join(remotionRoot, 'Root.tsx');
		writeFileSync(entryPoint, folderRootContents);

		const applyResponse = await applyCodemodHandler(
			getHandlerOptions({
				input: {
					codemod: {
						type: 'move-composition-to-folder',
						idToMove: 'NestedA',
						folderName: null,
						parentName: null,
					} satisfies RecastCodemod,
					dryRun: false,
					symbolicatedStack: {
						originalFunctionName: null,
						originalFileName: 'Root.tsx',
						originalLineNumber: 9,
						originalColumnNumber: 4,
						originalScriptCode: null,
					},
				},
				entryPoint,
				remotionRoot,
			}),
		);

		expect(applyResponse.success).toBe(true);
		const contents = readFileSync(entryPoint, 'utf-8');
		expect(contents.indexOf('id="NestedB"')).toBeLessThan(
			contents.indexOf('id="NestedA"'),
		);
		expect(getUndoStack()[0].description.undoMessage).toBe(
			'↩️  Move of composition "NestedA" to root',
		);

		const undoResponse = await undoHandler(
			getHandlerOptions({input: {}, entryPoint, remotionRoot}),
		);
		expect(undoResponse.success).toBe(true);
		expect(readFileSync(entryPoint, 'utf-8')).toBe(folderRootContents);
	} finally {
		clearUndoRedoStacks();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});

test('applyCodemodHandler creates new composition files with undo and redo', async () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-codemod-'));
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		sendEventToClient: () => undefined,
		sendEventToClientId: () => true,
		router: () => Promise.resolve(),
		closeConnections: () => Promise.resolve(),
		addNewClientListener: () => () => undefined,
	});

	try {
		clearUndoRedoStacks();
		const entryPoint = path.join(remotionRoot, 'Root.tsx');
		const componentFile = path.join(remotionRoot, 'FreshVideo.tsx');
		writeFileSync(entryPoint, rootContents);

		const applyResponse = await applyCodemodHandler(
			getHandlerOptions({
				input: {
					codemod: {
						type: 'new-composition',
						newId: 'FreshVideo',
						componentName: 'FreshVideo',
						componentImportPath: './FreshVideo',
						folderName: null,
						parentName: null,
						newDurationInFrames: 150,
						newFps: 30,
						newHeight: 1080,
						newWidth: 1920,
					} satisfies RecastCodemod,
					dryRun: false,
					symbolicatedStack: {
						originalFunctionName: null,
						originalFileName: 'Root.tsx',
						originalLineNumber: 9,
						originalColumnNumber: 4,
						originalScriptCode: null,
					},
				},
				entryPoint,
				remotionRoot,
			}),
		);

		expect(applyResponse.success).toBe(true);
		expect(readFileSync(entryPoint, 'utf-8')).toContain('id="FreshVideo"');
		expect(readFileSync(entryPoint, 'utf-8')).toContain(
			"import {FreshVideo} from './FreshVideo'",
		);
		expect(readFileSync(componentFile, 'utf-8')).toContain(
			'export const FreshVideo',
		);

		const undoResponse = await undoHandler(
			getHandlerOptions({input: {}, entryPoint, remotionRoot}),
		);
		expect(undoResponse.success).toBe(true);
		expect(readFileSync(entryPoint, 'utf-8')).toBe(rootContents);
		expect(existsSync(componentFile)).toBe(false);

		const redoResponse = await redoHandler(
			getHandlerOptions({input: {}, entryPoint, remotionRoot}),
		);
		expect(redoResponse.success).toBe(true);
		expect(readFileSync(entryPoint, 'utf-8')).toContain('id="FreshVideo"');
		expect(readFileSync(componentFile, 'utf-8')).toContain(
			'export const FreshVideo',
		);
	} finally {
		clearUndoRedoStacks();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});

test('creates a composition in a top-level folder', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: folderRootContents,
		codeMod: {
			type: 'new-composition',
			newId: 'FreshVideo',
			componentName: 'FreshVideo',
			componentImportPath: './FreshVideo',
			folderName: 'Parent',
			parentName: null,
			newDurationInFrames: 150,
			newFps: 30,
			newHeight: 1080,
			newWidth: 1920,
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents).toContain('id="FreshVideo"');
	expect(newContents).toContain('component={FreshVideo}');
	expect(newContents.indexOf('<Folder name="Parent">')).toBeLessThan(
		newContents.indexOf('id="FreshVideo"'),
	);
	expect(newContents.indexOf('id="FreshVideo"')).toBeLessThan(
		newContents.indexOf('<Folder name="Other">'),
	);
});

test('creates a composition in a nested folder by parent path', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: folderRootContents,
		codeMod: {
			type: 'new-composition',
			newId: 'FreshVideo',
			componentName: 'FreshVideo',
			componentImportPath: './FreshVideo',
			folderName: 'Shared',
			parentName: 'Other',
			newDurationInFrames: 150,
			newFps: 30,
			newHeight: 1080,
			newWidth: 1920,
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents).toContain('id="FreshVideo"');
	expect(newContents.indexOf('id="NestedB"')).toBeLessThan(
		newContents.indexOf('id="FreshVideo"'),
	);
	expect(newContents.indexOf('id="NestedA"')).toBeLessThan(
		newContents.indexOf('id="NestedB"'),
	);
});

test('creates a top-level folder', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: rootContents,
		codeMod: {
			type: 'new-folder',
			folderName: 'FreshFolder',
			parentName: null,
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents).toMatch(
		/import\s*\{[^}]*Folder[^}]*\}\s*from\s*['"]remotion['"]/,
	);
	expect(newContents).toContain('<Folder name="FreshFolder" />');
	expect(newContents.indexOf('id="KeepMe"')).toBeLessThan(
		newContents.indexOf('<Folder name="FreshFolder" />'),
	);
});

test('creates a folder in a nested folder by parent path', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: folderRootContents,
		codeMod: {
			type: 'new-folder',
			folderName: 'FreshFolder',
			parentName: 'Parent/Shared',
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents).toContain('<Folder name="FreshFolder" />');
	expect(newContents.indexOf('id="NestedA"')).toBeLessThan(
		newContents.indexOf('<Folder name="FreshFolder" />'),
	);
	expect(newContents.indexOf('<Folder name="FreshFolder" />')).toBeLessThan(
		newContents.indexOf('<Folder name="Other">'),
	);
});

test('creates a composition in a self-closing folder', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: selfClosingFolderRootContents,
		codeMod: {
			type: 'new-composition',
			newId: 'FreshVideo',
			componentName: 'FreshVideo',
			componentImportPath: './FreshVideo',
			folderName: 'Empty',
			parentName: null,
			newDurationInFrames: 150,
			newFps: 30,
			newHeight: 1080,
			newWidth: 1920,
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents).toContain('<Folder name="Empty">');
	expect(newContents).toContain('id="FreshVideo"');
	expect(newContents.indexOf('<Folder name="Empty">')).toBeLessThan(
		newContents.indexOf('id="FreshVideo"'),
	);
	expect(newContents.indexOf('id="FreshVideo"')).toBeLessThan(
		newContents.indexOf('id="KeepMe"'),
	);
});

test('moves a composition into a nested folder', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: folderRootContents,
		codeMod: {
			type: 'move-composition-to-folder',
			idToMove: 'NestedA',
			folderName: 'Shared',
			parentName: 'Other',
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents.indexOf('id="NestedB"')).toBeLessThan(
		newContents.indexOf('id="NestedA"'),
	);
	expect(newContents.match(/id="NestedA"/g)?.length).toBe(1);
	expect(newContents.indexOf('<Folder name="Parent">')).toBeLessThan(
		newContents.indexOf('<Folder name="Other">'),
	);
});

test('moves a composition to root', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: folderRootContents,
		codeMod: {
			type: 'move-composition-to-folder',
			idToMove: 'NestedA',
			folderName: null,
			parentName: null,
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents.indexOf('id="NestedB"')).toBeLessThan(
		newContents.indexOf('id="NestedA"'),
	);
	expect(newContents.match(/id="NestedA"/g)?.length).toBe(1);
});

test('does not use folders inside JSX attributes as move targets', () => {
	expect(() =>
		parseAndApplyCodemod({
			input: attributeFolderRootContents,
			codeMod: {
				type: 'move-composition-to-folder',
				idToMove: 'MoveMe',
				folderName: 'Shared',
				parentName: 'Parent',
			},
		}),
	).toThrow('Could not find folder "Parent/Shared"');
});

test('rejects moving a composition from a standalone JSX position', () => {
	expect(() =>
		parseAndApplyCodemod({
			input: standaloneCompositionRootContents,
			codeMod: {
				type: 'move-composition-to-folder',
				idToMove: 'Standalone',
				folderName: null,
				parentName: null,
			},
		}),
	).toThrow(
		'Cannot move composition "Standalone" because it is not a direct JSX child',
	);
});

test('moves a composition into a self-closing folder', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: selfClosingFolderRootContents,
		codeMod: {
			type: 'move-composition-to-folder',
			idToMove: 'KeepMe',
			folderName: 'Empty',
			parentName: null,
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents).toContain('<Folder name="Empty">');
	expect(newContents).toContain('</Folder>');
	expect(newContents.indexOf('<Folder name="Empty">')).toBeLessThan(
		newContents.indexOf('id="KeepMe"'),
	);
	expect(newContents.match(/id="KeepMe"/g)?.length).toBe(1);
});

test('creates a folder in a self-closing folder', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: selfClosingFolderRootContents,
		codeMod: {
			type: 'new-folder',
			folderName: 'Nested',
			parentName: 'Empty',
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents).toContain('<Folder name="Empty">');
	expect(newContents).toContain('<Folder name="Nested" />');
	expect(newContents.indexOf('<Folder name="Empty">')).toBeLessThan(
		newContents.indexOf('<Folder name="Nested" />'),
	);
	expect(newContents.indexOf('<Folder name="Nested" />')).toBeLessThan(
		newContents.indexOf('id="KeepMe"'),
	);
});

test('renames a nested folder by parent path', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: folderRootContents,
		codeMod: {
			type: 'rename-folder',
			folderName: 'Shared',
			parentName: 'Parent',
			newName: 'Renamed',
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents).toContain('<Folder name="Renamed">');
	expect(newContents.match(/<Folder name="Shared">/g)?.length).toBe(1);
	expect(newContents).toContain('id="NestedA"');
	expect(newContents).toContain('id="NestedB"');
});

test('deletes a nested folder by unwrapping its children', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: folderRootContents,
		codeMod: {
			type: 'delete-folder',
			folderName: 'Shared',
			parentName: 'Parent',
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents.match(/<Folder name="Shared">/g)?.length).toBe(1);
	expect(newContents).toContain('<Folder name="Parent">');
	expect(newContents).toContain('id="NestedA"');
	expect(newContents).toContain('id="NestedB"');
});

test('deletes a top-level folder by unwrapping its children', () => {
	const {changesMade, newContents} = parseAndApplyCodemod({
		input: folderRootContents,
		codeMod: {
			type: 'delete-folder',
			folderName: 'Parent',
			parentName: null,
		},
	});

	expect(changesMade.length).toBe(1);
	expect(newContents).not.toContain('<Folder name="Parent">');
	expect(newContents.match(/<Folder name="Shared">/g)?.length).toBe(2);
	expect(newContents).toContain('id="NestedA"');
	expect(newContents).toContain('id="NestedB"');
});
