import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {applyCodemodHandler} from '../preview-server/routes/apply-codemod';
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

const clearUndoRedoStacks = () => {
	(getUndoStack() as unknown as unknown[]).length = 0;
	(getRedoStack() as unknown as unknown[]).length = 0;
};

const getHandlerOptions = <T>({
	input,
	entryPoint,
	remotionRoot,
}: {
	input: T;
	entryPoint: string;
	remotionRoot: string;
}) => ({
	input,
	entryPoint,
	remotionRoot,
	request: {} as never,
	response: {} as never,
	logLevel: 'error' as const,
	methods: {
		removeJob: () => undefined,
		cancelJob: () => undefined,
		addJob: () => undefined,
	},
	publicDir: remotionRoot,
	binariesDirectory: null,
});

test('applyCodemodHandler pushes composition changes to undo and redo stacks', async () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-codemod-'));
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		sendEventToClient: () => undefined,
		sendEventToClientId: () => undefined,
		router: () => Promise.resolve(),
		closeConnections: () => Promise.resolve(),
		addNewClientListener: () => () => undefined,
	});

	try {
		clearUndoRedoStacks();
		const entryPoint = path.join(remotionRoot, 'Root.tsx');
		writeFileSync(entryPoint, rootContents);

		const applyResponse = await applyCodemodHandler(
			getHandlerOptions({
				input: {
					codemod: {type: 'delete-composition', idToDelete: 'DeleteMe'},
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
		expect(readFileSync(entryPoint, 'utf-8')).not.toContain('id="DeleteMe"');
		expect(readFileSync(entryPoint, 'utf-8')).toContain('id="KeepMe"');
		expect(getUndoStack().length).toBe(1);
		expect(getRedoStack().length).toBe(0);

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
		expect(readFileSync(entryPoint, 'utf-8')).not.toContain('id="DeleteMe"');
		expect(readFileSync(entryPoint, 'utf-8')).toContain('id="KeepMe"');
		expect(getUndoStack().length).toBe(1);
		expect(getRedoStack().length).toBe(0);
	} finally {
		clearUndoRedoStacks();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
