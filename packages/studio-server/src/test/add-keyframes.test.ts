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
import {addKeyframes} from '../preview-server/routes/add-keyframes';
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
\t\t\tstyle={{opacity: interpolate(frame, [0, 10], [0, 1])}}
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

const linearProgressiveBlurInput = `import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {HtmlInCanvas} from '@remotion/html-in-canvas';
import {Solid} from 'remotion';

export const Comp = () => {
\treturn (
\t\t<HtmlInCanvas
\t\t\twidth={1280}
\t\t\theight={720}
\t\t\teffects={[
\t\t\t\tlinearProgressiveBlur({
\t\t\t\t\tstart: [0.5, 0.5],
\t\t\t\t\tend: [0.816, -0.06],
\t\t\t\t}),
\t\t\t]}
\t\t>
\t\t\t<Solid width={1280} height={720} color="white" />
\t\t</HtmlInCanvas>
\t);
};
`;

const linearProgressiveBlurSchema = {
	start: {
		type: 'uv-coordinate',
		default: [0, 0.5],
	},
	end: {
		type: 'uv-coordinate',
		default: [1, 0.5],
	},
	startBlur: {
		type: 'number',
		default: 0,
		hiddenFromList: false,
	},
	endBlur: {
		type: 'number',
		default: 50,
		hiddenFromList: false,
	},
} satisfies InteractivitySchema;

test('addKeyframes batches sequence and effect adds into one undo entry', async () => {
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
	const dir = mkdtempSync(join(tmpdir(), 'remotion-add-keyframes-'));
	const fileName = 'Comp.tsx';
	const filePath = join(dir, fileName);
	const nodePath = {
		absolutePath: fileName,
		nodePath: lineColumnToNodePath(input, 7),
		sequenceKeys: ['style.opacity'],
		effectKeys: [['amount']],
	};

	try {
		writeFileSync(filePath, input);

		await addKeyframes({
			sequenceKeyframes: [
				{
					fileName,
					nodePath,
					key: 'style.opacity',
					frame: 5,
					value: JSON.stringify(0.5),
					schema: NoReactInternals.sequenceSchema,
				},
			],
			effectKeyframes: [
				{
					fileName,
					sequenceNodePath: nodePath,
					effectIndex: 0,
					key: 'amount',
					frame: 10,
					value: JSON.stringify(0.4),
					schema: effectSchema,
				},
			],
			clientId: 'test-client',
			remotionRoot: dir,
			logLevel: 'error',
		});

		const output = readFileSync(filePath, 'utf-8');
		expect(output).toContain(
			'opacity: interpolate(frame, [0, 5, 10], [0, 0.5, 1])',
		);
		expect(output).toContain(
			'amount: interpolate(frame, [0, 10, 20], [0.2, 0.4, 0.8])',
		);
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

test('addKeyframes adds a missing effect prop before keyframing it', async () => {
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
	const dir = mkdtempSync(join(tmpdir(), 'remotion-add-missing-effect-'));
	const fileName = 'Comp.tsx';
	const filePath = join(dir, fileName);
	const nodePath = {
		absolutePath: fileName,
		nodePath: lineColumnToNodePath(linearProgressiveBlurInput, 7),
		sequenceKeys: [],
		effectKeys: [['start', 'end', 'startBlur', 'endBlur']],
	};

	try {
		writeFileSync(filePath, linearProgressiveBlurInput);

		await addKeyframes({
			sequenceKeyframes: [],
			effectKeyframes: [
				{
					fileName,
					sequenceNodePath: nodePath,
					effectIndex: 0,
					key: 'startBlur',
					frame: 55,
					value: JSON.stringify(12),
					schema: linearProgressiveBlurSchema,
				},
			],
			clientId: 'test-client',
			remotionRoot: dir,
			logLevel: 'error',
		});

		const output = readFileSync(filePath, 'utf-8');
		expect(output).toContain('startBlur: interpolate(frame, [55], [12], {');
		expect(output).toContain("extrapolateLeft: 'clamp'");
		expect(output).toContain("extrapolateRight: 'clamp'");
	} finally {
		clearUndoStackForTests();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(dir, {force: true, recursive: true});
	}
});
