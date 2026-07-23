import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {InteractivitySchema} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {batchUpdateKeyframeSettings} from '../preview-server/routes/batch-update-keyframe-settings';
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
\t\t\tstyle={{opacity: interpolate(frame, [0, 10, 20], [0, 0.5, 1])}}
\t\t\teffects={[tint({amount: interpolate(frame, [0, 20], [0.2, 0.8])})]}
\t\t/>
\t);
};
`;

const effectSchema = {
	amount: {
		type: 'number',
		default: 0,
		hiddenFromList: false,
	},
} satisfies InteractivitySchema;

test('batches sequence and effect easing changes into one undo entry', async () => {
	clearUndoStackForTests();
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
	const dir = mkdtempSync(join(tmpdir(), 'remotion-keyframe-settings-'));
	const sequenceFileName = 'SequenceComp.tsx';
	const effectFileName = 'EffectComp.tsx';
	const sequenceFilePath = join(dir, sequenceFileName);
	const effectFilePath = join(dir, effectFileName);
	const sequenceNodePath = {
		absolutePath: sequenceFileName,
		nodePath: lineColumnToNodePath(input, 7),
		sequenceKeys: ['style.opacity'],
		effectKeys: [['amount']],
		videoConfigValues: null,
	};
	const effectNodePath = {
		...sequenceNodePath,
		absolutePath: effectFileName,
	};

	try {
		writeFileSync(sequenceFilePath, input);
		writeFileSync(effectFilePath, input);

		await batchUpdateKeyframeSettings({
			sequenceKeyframes: [
				{
					fileName: sequenceFileName,
					nodePath: sequenceNodePath,
					key: 'style.opacity',
					settings: {
						type: 'easing',
						segmentIndex: 0,
						easing: {type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
					},
					schema: NoReactInternals.sequenceSchema,
				},
				{
					fileName: sequenceFileName,
					nodePath: sequenceNodePath,
					key: 'style.opacity',
					settings: {
						type: 'easing',
						segmentIndex: 1,
						easing: {type: 'bezier', x1: 0, y1: 0, x2: 0.58, y2: 1},
					},
					schema: NoReactInternals.sequenceSchema,
				},
			],
			effectKeyframes: [
				{
					fileName: effectFileName,
					sequenceNodePath: effectNodePath,
					effectIndex: 0,
					key: 'amount',
					settings: {
						type: 'easing',
						segmentIndex: 0,
						easing: {type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
					},
					schema: effectSchema,
				},
			],
			clientId: 'test-client',
			remotionRoot: dir,
			logLevel: 'error',
		});

		const sequenceOutput = readFileSync(sequenceFilePath, 'utf-8');
		const effectOutput = readFileSync(effectFilePath, 'utf-8');
		expect(sequenceOutput).toContain(
			'easing: [Easing.bezier(0.42, 0, 1, 1), Easing.bezier(0, 0, 0.58, 1)]',
		);
		expect(effectOutput).toContain('easing: [Easing.bezier(0.42, 0, 1, 1)]');
		expect(getUndoStack()).toHaveLength(1);

		expect(popUndo()).toEqual({success: true});
		expect(readFileSync(sequenceFilePath, 'utf-8')).toBe(input);
		expect(readFileSync(effectFilePath, 'utf-8')).toBe(input);

		expect(popRedo()).toEqual({success: true});
		expect(readFileSync(sequenceFilePath, 'utf-8')).toBe(sequenceOutput);
		expect(readFileSync(effectFilePath, 'utf-8')).toBe(effectOutput);
	} finally {
		clearUndoStackForTests();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(dir, {force: true, recursive: true});
	}
});
