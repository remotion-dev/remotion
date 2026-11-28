import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {NoReactInternals} from 'remotion/no-react';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {moveKeyframes} from '../preview-server/routes/move-keyframes';
import {
	clearUndoStackForTests,
	getUndoStack,
	popRedo,
	popUndo,
} from '../preview-server/undo-stack';
import {lineColumnToNodePath} from './test-utils';

const input = `import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Comp = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill
\t\t\tstyle={{opacity: interpolate(frame, [0, 10], [0, 1])}}
\t\t/>
\t);
};
`;

test('moveKeyframes reports keyframe edits so undo and redo can remap selection', () => {
	clearUndoStackForTests();
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		getClientIds: () => [],
		addNewClientListener: () => () => undefined,
		closeConnections: () => Promise.resolve(),
		router: () => Promise.resolve(),
		sendEventToClient: () => undefined,
		sendEventToClientId: () => true,
	});
	const dir = mkdtempSync(join(tmpdir(), 'remotion-move-keyframes-'));
	const fileName = 'Comp.tsx';
	const filePath = join(dir, fileName);
	const nodePath = {
		absolutePath: fileName,
		nodePath: lineColumnToNodePath(input, 6),
		sequenceKeys: ['style.opacity'],
		effectKeys: [],
		videoConfigValues: null,
	};

	try {
		writeFileSync(filePath, input);

		moveKeyframes({
			sequenceKeyframes: [
				{
					fileName,
					nodePath,
					key: 'style.opacity',
					fromFrame: 0,
					toFrame: 5,
					schema: NoReactInternals.sequenceSchema,
				},
			],
			effectKeyframes: [],
			clientId: 'test-client',
			remotionRoot: dir,
			logLevel: 'error',
		});

		expect(readFileSync(filePath, 'utf-8')).toContain(
			'opacity: interpolate(frame, [5, 10], [0, 1])',
		);
		expect(getUndoStack()).toHaveLength(1);

		const undoResponse = popUndo();
		if (!undoResponse.success || undoResponse.nodePathMutation === null) {
			throw new Error('Expected undo to include a node path mutation');
		}

		const undoRemappings = undoResponse.nodePathMutation.files.flatMap(
			(file) => file.remappings,
		);
		expect(undoRemappings).toHaveLength(1);
		expect(undoRemappings[0].keyframeEdits).toEqual([
			{key: 'style.opacity', effectIndex: null, frame: 5, movedTo: 0},
		]);
		expect(readFileSync(filePath, 'utf-8')).toBe(input);

		const redoResponse = popRedo();
		if (!redoResponse.success || redoResponse.nodePathMutation === null) {
			throw new Error('Expected redo to include a node path mutation');
		}

		const redoRemappings = redoResponse.nodePathMutation.files.flatMap(
			(file) => file.remappings,
		);
		expect(redoRemappings).toHaveLength(1);
		expect(redoRemappings[0].keyframeEdits).toEqual([
			{key: 'style.opacity', effectIndex: null, frame: 0, movedTo: 5},
		]);
	} finally {
		cleanupLiveEvents();
		cleanupFileWatcher();
		clearUndoStackForTests();
		rmSync(dir, {recursive: true, force: true});
	}
});
