import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {InteractivitySchema} from 'remotion';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {saveMultipleEffectPropsHandler} from '../preview-server/routes/save-multiple-effect-props';
import {
	clearUndoStackForTests,
	getUndoStack,
	popRedo,
	popUndo,
} from '../preview-server/undo-stack';
import {lineColumnToNodePath} from './test-utils';

const blurSchema = {
	radius: {
		type: 'number',
		default: 40,
		description: 'Blur radius',
		hiddenFromList: false,
	},
} satisfies InteractivitySchema;

test('saveMultipleEffectProps batches selected effect resets into one undo entry', async () => {
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
	const dir = mkdtempSync(join(tmpdir(), 'remotion-save-effect-props-'));
	const fileName = 'Comp.tsx';
	const filePath = join(dir, fileName);
	const input = `import {blur} from '@remotion/effects/blur';
import {Solid} from 'remotion';

export const Comp = () => {
	return (
		<>
			<Solid
				width={240}
				height={240}
				color="#0b84f3"
				effects={[blur({radius: 20})]}
			/>
			<Solid
				width={240}
				height={240}
				color="#f30b84"
				effects={[blur({radius: 30})]}
			/>
		</>
	);
};
`;
	const makeNodePath = (line: number) => ({
		absolutePath: fileName,
		nodePath: lineColumnToNodePath(input, line),
		sequenceKeys: [],
		effectKeys: [['radius']],
		videoConfigValues: null,
	});

	try {
		writeFileSync(filePath, input);

		const response = await saveMultipleEffectPropsHandler({
			input: {
				edits: [
					{
						type: 'value',
						fileName,
						sequenceNodePath: makeNodePath(7),
						effectIndex: 0,
						key: 'radius',
						value: '40',
						defaultValue: '40',
						schema: blurSchema,
					},
					{
						type: 'value',
						fileName,
						sequenceNodePath: makeNodePath(13),
						effectIndex: 0,
						key: 'radius',
						value: '40',
						defaultValue: '40',
						schema: blurSchema,
					},
				],
				clientId: 'test-client',
				undoLabel: 'Reset selected effect props',
				redoLabel: 'Reapply selected effect props',
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
			configFile: null,
		});

		const output = readFileSync(filePath, 'utf-8');
		expect(output).not.toContain('radius: 20');
		expect(output).not.toContain('radius: 30');
		expect(response.results).toHaveLength(2);
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
