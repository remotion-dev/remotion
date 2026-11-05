import {expect, spyOn, test} from 'bun:test';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {renameFolder, updateCompositionMetadata} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	CompositionEditResponse,
	SymbolicatedStackFrame,
	UndoRedoNavigation,
} from '@remotion/studio-shared';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import type {ApiHandler} from '../preview-server/api-types';
import {setLiveEventsListener} from '../preview-server/live-events';
import {addCompositionHandler} from '../preview-server/routes/add-composition';
import {addFolderHandler} from '../preview-server/routes/add-folder';
import {applyVisualControlHandler} from '../preview-server/routes/apply-visual-control-change';
import {deleteCompositionHandler} from '../preview-server/routes/delete-composition';
import {duplicateCompositionHandler} from '../preview-server/routes/duplicate-composition';
import {moveCompositionHandler} from '../preview-server/routes/move-composition';
import {prepareOpenTimelineImportHandler} from '../preview-server/routes/prepare-open-timeline-import';
import {redoHandler} from '../preview-server/routes/redo';
import {renameCompositionHandler} from '../preview-server/routes/rename-composition';
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

const clearUndoRedoStacks = () => {
	(getUndoStack() as unknown as unknown[]).length = 0;
	(getRedoStack() as unknown as unknown[]).length = 0;
};

test('folder edits do not run Prettier after applying source edits', () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-codemod-'));
	const filePath = path.join(remotionRoot, 'Root.tsx');
	const input = `import {Folder} from 'remotion';

const untouched  =  { value : "keep" };
export const Root = () => <Folder name="Before" />;
`;

	try {
		writeFileSync(filePath, input);
		const output = renameFolder({
			project: {rootDir: remotionRoot, files: {[filePath]: input}},
			compositionFile: filePath,
			folder: {name: 'Before', parentName: null},
			newName: 'After',
		});

		expect(output.changes[0].nextContents).toBe(
			input.replace('"Before"', '"After"'),
		);
	} finally {
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});

test('metadata edits do not run Prettier after applying source edits', () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-codemod-'));
	const filePath = path.join(remotionRoot, 'Root.tsx');
	const input = `import {Composition} from 'remotion';
const untouched  =  { value : "keep" };
export const Root=()=> <Composition id='Comp' width = { WIDTH }/>;
`;

	try {
		writeFileSync(filePath, input);
		const output = updateCompositionMetadata({
			project: {rootDir: remotionRoot, files: {[filePath]: input}},
			compositionFile: filePath,
			compositionId: 'Comp',
			metadata: {
				durationInFrames: 90,
				height: 1080,
				width: 1920,
			},
		});

		expect(output.changes[0].nextContents)
			.toBe(`import {Composition} from 'remotion';
const untouched  =  { value : "keep" };
export const Root=()=> <Composition id='Comp' width = {1920} durationInFrames={90} height={1080}/>;
`);
	} finally {
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});

test('visual-control handler preserves source formatting', async () => {
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
	const filePath = path.join(remotionRoot, 'Root.tsx');
	const input = `const untouched  =  { value : "keep" };
export const Root=()=> visualControl('opacity', OPACITY);
`;

	try {
		clearUndoRedoStacks();
		writeFileSync(filePath, input);
		const response = await applyVisualControlHandler(
			getHandlerOptions({
				input: {
					fileName: 'Root.tsx',
					changes: [
						{
							id: 'opacity',
							newValueSerialized: '0.5',
							newValueIsUndefined: false,
							enumPaths: [],
						},
					],
				},
				entryPoint: filePath,
				remotionRoot,
			}),
		);

		expect(response.success).toBe(true);
		expect(readFileSync(filePath, 'utf-8')).toBe(
			input.replace('OPACITY', '0.5'),
		);
		expect(getUndoStack()).toHaveLength(1);
	} finally {
		clearUndoRedoStacks();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(remotionRoot, {recursive: true, force: true});
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
	configFile: null,
	getDefaultCodingAgent: () => null,
	getDefaultEditor: () => null,
});

type CompositionEditRequest = {
	symbolicatedStack: SymbolicatedStackFrame | null;
	undoRedoNavigation: UndoRedoNavigation | null;
};

const expectCompositionEditUndoRedo = async <
	Request extends CompositionEditRequest,
>({
	handler,
	request,
	assertApplied,
	expectedUndoMessage,
	expectedLogMessage,
}: {
	handler: ApiHandler<Request, CompositionEditResponse>;
	request: Request;
	assertApplied: (contents: string) => void;
	expectedUndoMessage: string;
	expectedLogMessage: string | null;
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

		const applyResponse = await handler(
			getHandlerOptions({
				input: {
					...request,
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
			expect(logOutput).not.toMatch(/\[\d+ms\]/);
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

test('deleteCompositionHandler pushes composition deletions to undo and redo stacks', async () => {
	await expectCompositionEditUndoRedo({
		handler: deleteCompositionHandler,
		request: {
			idToDelete: 'DeleteMe',
			undoRedoNavigation: null,
			symbolicatedStack: null,
		},
		assertApplied: (contents) => {
			expect(contents).not.toContain('id="DeleteMe"');
			expect(contents).toContain('id="KeepMe"');
		},
		expectedUndoMessage: '↩️  Deletion of composition "DeleteMe"',
		expectedLogMessage: null,
	});
});

test('renameCompositionHandler logs composition renames and pushes them to the undo and redo stacks', async () => {
	await expectCompositionEditUndoRedo({
		handler: renameCompositionHandler,
		request: {
			idToRename: 'DeleteMe',
			newId: 'Renamed',
			undoRedoNavigation: null,
			symbolicatedStack: null,
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

test('duplicateCompositionHandler pushes composition and still duplications to undo and redo stacks', async () => {
	for (const tag of ['Composition', 'Still'] as const) {
		await expectCompositionEditUndoRedo({
			handler: duplicateCompositionHandler,
			request: {
				idToDuplicate: 'DeleteMe',
				newId: 'Duplicated',
				newDurationInFrames: 120,
				newFps: 30,
				newHeight: null,
				newWidth: null,
				tag,
				undoRedoNavigation: null,
				symbolicatedStack: null,
			},
			assertApplied: (contents) => {
				expect(contents).toContain('id="DeleteMe"');
				expect(contents).toContain('id="Duplicated"');
				expect(contents).toContain('id="KeepMe"');
				if (tag === 'Still') {
					const still = contents.match(/<Still[\s\S]*?\/>/)?.[0];
					expect(still).toContain('id="Duplicated"');
					expect(still).not.toContain('fps=');
					expect(still).not.toContain('durationInFrames=');
				}
			},
			expectedUndoMessage:
				'↩️  Duplication of composition "DeleteMe" to "Duplicated"',
			expectedLogMessage: null,
		});
	}
});

test('addFolderHandler pushes folder creations to undo and redo stacks', async () => {
	await expectCompositionEditUndoRedo({
		handler: addFolderHandler,
		request: {
			folderName: 'FreshFolder',
			parentName: null,
			undoRedoNavigation: null,
			symbolicatedStack: null,
		},
		assertApplied: (contents) => {
			expect(contents).toContain('<Folder name="FreshFolder" />');
			expect(contents).toContain('id="KeepMe"');
		},
		expectedUndoMessage: '↩️  Creation of folder "FreshFolder"',
		expectedLogMessage: null,
	});
});

test('moveCompositionHandler pushes composition moves to undo and redo stacks', async () => {
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

		const applyResponse = await moveCompositionHandler(
			getHandlerOptions({
				input: {
					compositionId: 'NestedA',
					destination: {
						type: 'folder',
						folderName: 'Shared',
						parentName: 'Other',
					},
					undoRedoNavigation: null,
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
		if (!applyResponse.success) {
			throw new Error(applyResponse.reason);
		}

		expect(applyResponse.nodePathMutation).not.toBeNull();
		const contents = readFileSync(entryPoint, 'utf-8');
		expect(contents.indexOf('id="NestedB"')).toBeLessThan(
			contents.indexOf('id="NestedA"'),
		);
		expect(getUndoStack()[0].description.undoMessage).toBe(
			'↩️  Move of composition "NestedA"',
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

test('moveCompositionHandler pushes composition moves to root to undo and redo stacks', async () => {
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

		const applyResponse = await moveCompositionHandler(
			getHandlerOptions({
				input: {
					compositionId: 'NestedA',
					destination: {type: 'root'},
					undoRedoNavigation: null,
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
		if (!applyResponse.success) {
			throw new Error(applyResponse.reason);
		}

		expect(applyResponse.nodePathMutation).not.toBeNull();
		const contents = readFileSync(entryPoint, 'utf-8');
		expect(contents.indexOf('id="NestedB"')).toBeLessThan(
			contents.indexOf('id="NestedA"'),
		);
		expect(getUndoStack()[0].description.undoMessage).toBe(
			'↩️  Move of composition "NestedA"',
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

test('addCompositionHandler creates compositions and timecoded imports with undo and redo', async () => {
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

		const applyResponse = await addCompositionHandler(
			getHandlerOptions({
				input: {
					options: {
						asset: null,
						canvasCapture: null,
						openTimeline: null,
						newId: 'FreshVideo',
						componentName: 'FreshVideo',
						componentImportPath: './FreshVideo',
						folderName: null,
						parentName: null,
						newDurationInFrames: 150,
						newFps: 30,
						newHeight: 1080,
						newWidth: 1920,
					},
					undoRedoNavigation: null,
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
		expect(readFileSync(entryPoint, 'utf-8')).toBe(
			"import {FreshVideo} from './FreshVideo';\n" +
				rootContents.replace(
					'\t\t</>',
					[
						'\t\t\t<Composition',
						'\t\t\t\tid="FreshVideo"',
						'\t\t\t\tcomponent={FreshVideo}',
						'\t\t\t\tdurationInFrames={150}',
						'\t\t\t\tfps={30}',
						'\t\t\t\twidth={1920}',
						'\t\t\t\theight={1080}',
						'\t\t\t/>',
						'\t\t</>',
					].join('\n'),
				),
		);
		expect(readFileSync(entryPoint, 'utf-8')).toContain(
			"import {FreshVideo} from './FreshVideo'",
		);
		expect(readFileSync(componentFile, 'utf-8')).toContain(
			'export const FreshVideo',
		);

		const mediaFile = path.join(remotionRoot, 'timecoded.mov');
		const publicDir = path.join(remotionRoot, 'public');
		mkdirSync(publicDir);
		await RenderInternals.callFf({
			bin: 'ffmpeg',
			args: [
				'-loop',
				'1',
				'-framerate',
				'24',
				'-i',
				path.join(__dirname, '../../web/favicon.png'),
				'-frames:v',
				'52',
				'-vf',
				'scale=16:16',
				'-pix_fmt',
				'yuv420p',
				'-c:v',
				'libx264',
				'-timecode',
				'00:00:41:18',
				mediaFile,
			],
			indent: false,
			logLevel: 'error',
			binariesDirectory: null,
			cancelSignal: undefined,
		});
		const timeRange = (start: number, duration: number) => ({
			OTIO_SCHEMA: 'TimeRange.1',
			start_time: {OTIO_SCHEMA: 'RationalTime.1', value: start, rate: 24},
			duration: {OTIO_SCHEMA: 'RationalTime.1', value: duration, rate: 24},
		});
		const contents = JSON.stringify({
			OTIO_SCHEMA: 'Timeline.1',
			tracks: {
				OTIO_SCHEMA: 'Stack.1',
				children: [
					{
						OTIO_SCHEMA: 'Track.1',
						kind: 'Video',
						children: [
							{start: 1002, duration: 24, available: null},
							{start: 1006, duration: 12, available: null},
							{start: 8, duration: 8, available: timeRange(0, 52)},
						].map(({start, duration, available}) => ({
							OTIO_SCHEMA: 'Clip.2',
							source_range: timeRange(start, duration),
							active_media_reference_key: 'DEFAULT_MEDIA',
							media_references: {
								DEFAULT_MEDIA: {
									OTIO_SCHEMA: 'ExternalReference.1',
									target_url: mediaFile,
									available_range: available,
								},
							},
						})),
					},
				],
			},
		});
		const prepared = await prepareOpenTimelineImportHandler({
			...getHandlerOptions({
				input: {
					contents,
					mediaDirectory: null,
					componentName: 'Imported',
					fps: 24,
					width: 16,
					height: 16,
				},
				entryPoint,
				remotionRoot,
			}),
			publicDir,
		});
		expect(prepared.metadata?.durationInFrames).toBe(44);
		expect(prepared.diagnostics).toEqual([]);
		expect(prepared.filesToCopy).toBe(1);
		const imported = await addCompositionHandler({
			...getHandlerOptions({
				input: {
					options: {
						asset: null,
						canvasCapture: null,
						openTimeline: {contents, mediaDirectory: null},
						newId: 'Imported',
						componentName: 'Imported',
						componentImportPath: './Imported',
						folderName: null,
						parentName: null,
						newDurationInFrames: 44,
						newFps: 24,
						newWidth: 16,
						newHeight: 16,
					},
					undoRedoNavigation: null,
					symbolicatedStack: {
						originalFileName: 'Root.tsx',
						originalLineNumber: 1,
						originalColumnNumber: 1,
						originalFunctionName: null,
						originalScriptCode: null,
					},
				},
				entryPoint,
				remotionRoot,
			}),
			publicDir,
		});
		expect(imported.success).toBe(true);
		const importedSource = readFileSync(
			path.join(remotionRoot, 'Imported.tsx'),
			'utf-8',
		);
		const videos = [...importedSource.matchAll(/<Video[\s\S]*?\/>/g)].map(
			(match) => match[0],
		);
		expect(videos).toHaveLength(3);
		expect(videos[0]).toContain('durationInFrames={24}');
		expect(videos[0]).not.toContain('trimBefore');
		expect(videos[1]).toContain('trimBefore={4}');
		expect(videos[1]).toContain('from={24}');
		expect(videos[1]).toContain('durationInFrames={12}');
		expect(videos[2]).toContain('trimBefore={8}');
		expect(videos[2]).toContain('from={36}');
		expect(videos[2]).toContain('durationInFrames={8}');
		const importedAsset = /staticFile\('([^']+)'\)/.exec(videos[0])![1];
		expect(readFileSync(path.join(publicDir, importedAsset))).toEqual(
			readFileSync(mediaFile),
		);
		const undoImport = await undoHandler(
			getHandlerOptions({input: {}, entryPoint, remotionRoot}),
		);
		expect(undoImport.success).toBe(true);
		expect(existsSync(path.join(remotionRoot, 'Imported.tsx'))).toBe(false);
		expect(readFileSync(entryPoint, 'utf-8')).toContain('id="FreshVideo"');

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

test('addCompositionHandler creates an interactive Canvas Capture composition', async () => {
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
		const componentFile = path.join(remotionRoot, 'FreshCapture.tsx');
		writeFileSync(entryPoint, rootContents);

		const applyResponse = await addCompositionHandler(
			getHandlerOptions({
				input: {
					options: {
						asset: null,
						openTimeline: null,
						canvasCapture: {
							videoFileName: 'capture.mp4',
							videoHeight: 1080,
							videoWidth: 1920,
							keyframeFps: 30,
							data: {
								captureMetadata: {density: 2},
								mouseMovements: [
									{
										timeInSeconds: 0,
										canvasX: 10,
										canvasY: 20,
										cursor:
											'url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%2F%3E") 6 7, alias',
									},
									{
										timeInSeconds: 1,
										canvasX: 30,
										canvasY: 40,
										cursor: 'pointer',
									},
								],
								pointerClicks: [
									{timeInSeconds: 0.5, type: 'pointer-down'},
									{timeInSeconds: 0.75, type: 'pointer-up'},
								],
							},
						},
						newId: 'FreshCapture',
						componentName: 'FreshCapture',
						componentImportPath: './FreshCapture',
						folderName: null,
						parentName: null,
						newDurationInFrames: 90,
						newFps: 30,
						newHeight: 720,
						newWidth: 1280,
					},
					undoRedoNavigation: null,
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
		expect(readFileSync(entryPoint, 'utf-8')).toContain(
			"import {FreshCapture} from './FreshCapture'",
		);
		const rootContentsAfterImport = readFileSync(entryPoint, 'utf-8');
		expect(rootContentsAfterImport).toContain('id="FreshCapture"');
		expect(rootContentsAfterImport).toContain('component={FreshCapture}');
		const componentContents = readFileSync(componentFile, 'utf-8');
		expect(componentContents).toContain(
			"import {MacOSCursor} from '@remotion/mac-cursors'",
		);
		expect(componentContents).toContain('customCursor={');
		expect(componentContents).toContain(
			'url("data:image/svg+xml,%3Csvg%20width%3D%2224%22%2F%3E") 6 7, alias',
		);
		expect(componentContents).toMatch(
			/<Video\s+src=\{staticFile\('capture\.mp4'\)\}\s+durationInFrames=\{90\}/,
		);
		expect(componentContents).toContain('width: 1920');
		expect(componentContents).toContain('height: 1080');
		expect(rootContentsAfterImport).toContain('width={1280}');
		expect(rootContentsAfterImport).toContain('height={720}');

		const undoResponse = await undoHandler(
			getHandlerOptions({input: {}, entryPoint, remotionRoot}),
		);
		expect(undoResponse.success).toBe(true);
		expect(readFileSync(entryPoint, 'utf-8')).toBe(rootContents);
		expect(existsSync(componentFile)).toBe(false);
	} finally {
		clearUndoRedoStacks();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
