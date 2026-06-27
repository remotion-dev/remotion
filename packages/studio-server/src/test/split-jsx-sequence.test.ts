import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {splitJsxSequence} from '../codemods/split-jsx-sequence';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {splitJsxSequenceHandler} from '../preview-server/routes/split-jsx-sequence';
import {getUndoStack} from '../preview-server/undo-stack';
import {lineColumnToNodePath} from './test-utils';

const wrap = (sequence: string) => `import {Sequence, Series} from 'remotion';

export const Comp = () => {
	return (
		<>
			${sequence}
		</>
	);
};
`;

const split = async (sequence: string, splitFrame: number) => {
	const input = wrap(sequence);
	const {output} = await splitJsxSequence({
		input,
		nodePath: lineColumnToNodePath(input, 6),
		splitFrame,
	});

	return output;
};

test('splitJsxSequence splits a sequence with no duration', async () => {
	const output = await split('<Sequence from={0} />', 30);

	expect(output).toContain('<Sequence from={0} durationInFrames={30} />');
	expect(output).toContain('<Sequence from={30} trimBefore={30} />');
});

test('splitJsxSequence omits right Infinity duration', async () => {
	const output = await split(
		'<Sequence from={0} durationInFrames={Infinity} />',
		30,
	);

	expect(output).toContain('<Sequence from={0} durationInFrames={30} />');
	expect(output).toContain('<Sequence from={30} trimBefore={30} />');
	expect(output).not.toContain('durationInFrames={Infinity}');
});

test('splitJsxSequence keeps missing left from omitted', async () => {
	const output = await split('<Sequence durationInFrames={50} />', 30);

	expect(output).toContain('<Sequence durationInFrames={30} />');
	expect(output).toContain(
		'<Sequence from={30} durationInFrames={20} trimBefore={30} />',
	);
});

test('splitJsxSequence splits finite duration and trimBefore', async () => {
	const output = await split(
		'<Sequence from={10} durationInFrames={50} trimBefore={5} />',
		30,
	);

	expect(output).toContain(
		'<Sequence from={10} durationInFrames={20} trimBefore={5} />',
	);
	expect(output).toContain(
		'<Sequence from={30} durationInFrames={30} trimBefore={25} />',
	);
});

test('splitJsxSequence splits from-only sequence', async () => {
	const output = await split('<Sequence from={10} />', 30);

	expect(output).toContain('<Sequence from={10} durationInFrames={20} />');
	expect(output).toContain('<Sequence from={30} trimBefore={20} />');
});

test('splitJsxSequence rejects boundary and dynamic splits', async () => {
	await expect(
		split('<Sequence from={10} durationInFrames={20} />', 10),
	).rejects.toThrow(/sequence start/);
	await expect(
		split('<Sequence from={10} durationInFrames={20} />', 30),
	).rejects.toThrow(/sequence end/);
	await expect(
		split('<Sequence from={10} durationInFrames={20} />', 8),
	).rejects.toThrow(/sequence start/);
	await expect(
		split('<Sequence from={10} durationInFrames={20} />', 10.5),
	).rejects.toThrow(/integer/);
	await expect(
		split('<Sequence from={start} durationInFrames={20} />', 15),
	).rejects.toThrow(/dynamic from/);
});

test('splitJsxSequence rejects Series.Sequence', async () => {
	await expect(
		split('<Series.Sequence from={0} durationInFrames={50} />', 30),
	).rejects.toThrow(/Only <Sequence>/);
});

const clearUndoStack = () => {
	(getUndoStack() as unknown as unknown[]).length = 0;
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

test('splitJsxSequenceHandler writes success and failure responses', async () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-split-'));
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
		clearUndoStack();
		const entryPoint = path.join(remotionRoot, 'Root.tsx');
		const input = wrap('<Sequence from={0} durationInFrames={50} />');
		writeFileSync(entryPoint, input);

		const success = await splitJsxSequenceHandler(
			getHandlerOptions({
				input: {
					fileName: entryPoint,
					nodePath: lineColumnToNodePath(input, 6),
					splitFrame: 30,
				},
				entryPoint,
				remotionRoot,
			}),
		);

		expect(success.success).toBe(true);
		expect(readFileSync(entryPoint, 'utf-8')).toContain(
			'<Sequence from={30} durationInFrames={20} trimBefore={30} />',
		);
		expect(getUndoStack().length).toBe(1);

		const failure = await splitJsxSequenceHandler(
			getHandlerOptions({
				input: {
					fileName: entryPoint,
					nodePath: lineColumnToNodePath(input, 6),
					splitFrame: 0,
				},
				entryPoint,
				remotionRoot,
			}),
		);

		expect(failure.success).toBe(false);
	} finally {
		cleanupFileWatcher();
		cleanupLiveEvents();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
