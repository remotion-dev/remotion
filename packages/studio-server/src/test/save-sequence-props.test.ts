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
import {
	convertSequencePropEditToCodemodChange,
	saveSequencePropsHandler,
	shouldSuppressHmrForSequencePropEdits,
} from '../preview-server/routes/save-sequence-props';
import {
	clearUndoStackForTests,
	getUndoStack,
	popUndo,
} from '../preview-server/undo-stack';
import {lineColumnToNodePath} from './test-utils';

const starSchema = {
	points: {
		type: 'number',
		default: 5,
		description: 'Points',
		hiddenFromList: false,
	},
} satisfies InteractivitySchema;

test('saveSequenceProps suppresses HMR for regular visual prop edits', () => {
	expect(
		shouldSuppressHmrForSequencePropEdits([
			{key: 'style.translate'},
			{key: 'hidden'},
		]),
	).toBe(true);
});

test('saveSequenceProps does not suppress HMR for showInTimeline edits', () => {
	expect(
		shouldSuppressHmrForSequencePropEdits([
			{key: 'style.translate'},
			{key: 'showInTimeline'},
		]),
	).toBe(false);
});

test('saveSequenceProps does not suppress HMR for Google Font source edits', () => {
	expect(
		shouldSuppressHmrForSequencePropEdits([
			{
				key: 'style.fontFamily',
				sourceEdit: {
					type: 'google-font',
					font: {
						fontFamily: 'Roboto',
						importName: 'Roboto',
						style: 'normal',
						weights: ['400', '700', '800'],
						subsets: ['latin'],
					},
				},
			},
		]),
	).toBe(false);
});

test('saveSequenceProps forwards element schemas to the codemod', () => {
	const change = convertSequencePropEditToCodemodChange({
		nodePath: {
			absolutePath: '/tmp/Composition.tsx',
			nodePath: ['program', 'body', 0],
			sequenceKeys: [],
			effectKeys: [],
		},
		key: 'points',
		value: 7,
		defaultValue: 5,
		schema: starSchema,
		sourceEdit: null,
	});

	expect(change).toEqual({
		nodePath: ['program', 'body', 0],
		updates: [
			{
				key: 'points',
				value: 7,
				defaultValue: 5,
				googleFont: null,
			},
		],
		schema: starSchema,
	});
});

test('saveSequenceProps batches sequence movement and keyframe movement into one undo entry', async () => {
	clearUndoStackForTests();
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		addNewClientListener: () => () => undefined,
		closeConnections: () => Promise.resolve(),
		router: () => Promise.resolve(),
		sendEventToClient: () => undefined,
		sendEventToClientId: () => undefined,
	});
	const dir = mkdtempSync(join(tmpdir(), 'remotion-save-sequence-props-'));
	const fileName = 'Comp.tsx';
	const filePath = join(dir, fileName);
	const input = `import {Sequence, interpolate, useCurrentFrame} from 'remotion';

export const Comp = () => {
\tconst frame = useCurrentFrame();
\treturn (
\t\t<Sequence
\t\t\tfrom={0}
\t\t\tstyle={{opacity: interpolate(frame, [0, 20], [0, 1])}}
\t\t/>
\t);
};
`;
	const nodePath = {
		absolutePath: fileName,
		nodePath: lineColumnToNodePath(input, 6),
		sequenceKeys: ['from', 'style.opacity'],
		effectKeys: [],
	};

	try {
		writeFileSync(filePath, input);

		await saveSequencePropsHandler({
			input: {
				edits: [
					{
						fileName,
						nodePath,
						key: 'from',
						value: {type: 'json', serialized: JSON.stringify(10)},
						defaultValue: '0',
						schema: NoReactInternals.sequenceSchema,
						sourceEdit: null,
					},
				],
				movedKeyframes: {
					sequenceKeyframes: [
						{
							fileName,
							nodePath,
							key: 'style.opacity',
							fromFrame: 0,
							toFrame: 10,
							schema: NoReactInternals.sequenceSchema,
						},
						{
							fileName,
							nodePath,
							key: 'style.opacity',
							fromFrame: 20,
							toFrame: 30,
							schema: NoReactInternals.sequenceSchema,
						},
					],
					effectKeyframes: [],
				},
				clientId: 'test-client',
				undoLabel: 'Move sequence',
				redoLabel: 'Move sequence back',
			},
			entryPoint: '',
			remotionRoot: dir,
			request: {} as never,
			response: {} as never,
			logLevel: 'error',
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: '',
			binariesDirectory: null,
		});

		const output = readFileSync(filePath, 'utf-8');
		expect(output).toContain('from={10}');
		expect(output).toContain('interpolate(frame, [10, 30], [0, 1])');
		expect(getUndoStack()).toHaveLength(1);

		expect(popUndo()).toEqual({success: true});
		expect(readFileSync(filePath, 'utf-8')).toBe(input);
	} finally {
		clearUndoStackForTests();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(dir, {force: true, recursive: true});
	}
});
