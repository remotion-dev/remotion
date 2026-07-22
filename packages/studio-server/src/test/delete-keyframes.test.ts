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
import {deleteKeyframes} from '../preview-server/routes/delete-keyframes';
import {
	clearUndoStackForTests,
	getUndoStack,
	popRedo,
	popUndo,
} from '../preview-server/undo-stack';
import {lineColumnToNodePath} from './test-utils';

const input = `import {tint} from '@remotion/effects/tint';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Comp = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<AbsoluteFill
\t\t\tstyle={{
\t\t\t\topacity: interpolate(frame, [0, 10], [0, 1]),
\t\t\t\tscale: interpolate(frame, [30], [1]),
\t\t\t}}
\t\t\teffects={[tint({amount: interpolate(frame, [0, 20], [0.2, 0.8])})]}
\t\t/>
\t);
};
`;

test('deleteKeyframes batches sequence and effect deletes into one undo entry', async () => {
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		addNewClientListener: () => () => undefined,
		closeConnections: () => Promise.resolve(),
		router: () => Promise.resolve(),
		sendEventToClient: () => undefined,
		sendEventToClientId: () => true,
	});
	const dir = mkdtempSync(join(tmpdir(), 'remotion-delete-keyframes-'));
	const fileName = 'Comp.tsx';
	const filePath = join(dir, fileName);
	const nodePath = {
		absolutePath: fileName,
		nodePath: lineColumnToNodePath(input, 7),
		sequenceKeys: ['style.opacity', 'style.scale'],
		effectKeys: [['amount']],
		videoConfigValues: null,
	};

	try {
		writeFileSync(filePath, input);

		await deleteKeyframes({
			sequenceKeyframes: [
				{
					fileName,
					nodePath,
					key: 'style.opacity',
					frame: 0,
					schema: NoReactInternals.sequenceSchema,
					valueWhenLastKeyframeDeleted: 0.4,
				},
				{
					fileName,
					nodePath,
					key: 'style.opacity',
					frame: 10,
					schema: NoReactInternals.sequenceSchema,
					valueWhenLastKeyframeDeleted: 0.4,
				},
				{
					fileName,
					nodePath,
					key: 'style.scale',
					frame: 30,
					schema: NoReactInternals.sequenceSchema,
					valueWhenLastKeyframeDeleted: 1,
				},
			],
			effectKeyframes: [
				{
					fileName,
					sequenceNodePath: nodePath,
					effectIndex: 0,
					key: 'amount',
					frame: 0,
					schema: NoReactInternals.sequenceSchema,
					valueWhenLastKeyframeDeleted: 0.6,
				},
				{
					fileName,
					sequenceNodePath: nodePath,
					effectIndex: 0,
					key: 'amount',
					frame: 20,
					schema: NoReactInternals.sequenceSchema,
					valueWhenLastKeyframeDeleted: 0.6,
				},
			],
			clientId: 'test-client',
			remotionRoot: dir,
			logLevel: 'error',
		});

		const output = readFileSync(filePath, 'utf-8');
		expect(output).toContain('opacity: 0.4');
		expect(output).not.toContain('scale: 1');
		expect(output).toContain('amount: 0.6');
		expect(getUndoStack()).toHaveLength(1);

		expect(popUndo()).toEqual({success: true});
		expect(readFileSync(filePath, 'utf-8')).toBe(input);

		expect(popRedo()).toEqual({success: true});
		expect(readFileSync(filePath, 'utf-8')).toBe(output);
	} finally {
		clearUndoStackForTests();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(dir, {force: true, recursive: true});
	}
});
