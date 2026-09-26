import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {splitSequencesHandler} from '../preview-server/routes/split-sequences';
import {getUndoStack} from '../preview-server/undo-stack';
import {lineContainingToNodePath} from './test-utils';

const wrap = (
	sequence: string,
) => `import {AbsoluteFill, Img, Interactive, Sequence, Series, Solid} from 'remotion';
import {Gif} from '@remotion/gif';

export const Comp = () => {
	return (
		<>
			${sequence}
		</>
	);
};
`;

const sequenceTimingKeys = ['from', 'durationInFrames', 'trimBefore'];

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
	configFile: null,
	getDefaultCodingAgent: () => null,
	getDefaultEditor: () => null,
});

test('splitSequencesHandler writes success and failure responses', async () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-split-'));
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
		clearUndoStack();
		const entryPoint = path.join(remotionRoot, 'Root.tsx');
		const input = wrap(
			'<AbsoluteFill name="one" from={0} durationInFrames={50} />\n\t\t\t<AbsoluteFill name="two" from={10} durationInFrames={50} />',
		);
		writeFileSync(entryPoint, input);

		const success = await splitSequencesHandler(
			getHandlerOptions({
				input: {
					sequences: [
						{
							fileName: entryPoint,
							nodePath: lineContainingToNodePath(input, 'name="one"'),
							sequenceKeys: sequenceTimingKeys,
							splitFrame: 30,
						},
						{
							fileName: entryPoint,
							nodePath: lineContainingToNodePath(input, 'name="two"'),
							sequenceKeys: sequenceTimingKeys,
							splitFrame: 30,
						},
					],
				},
				entryPoint,
				remotionRoot,
			}),
		);

		expect(success.success).toBe(true);
		expect(readFileSync(entryPoint, 'utf-8')).toContain(
			'<AbsoluteFill name="one" from={30} durationInFrames={20} trimBefore={30} />',
		);
		expect(readFileSync(entryPoint, 'utf-8')).toContain(
			'<AbsoluteFill name="two" from={30} durationInFrames={30} trimBefore={20} />',
		);
		expect(getUndoStack().length).toBe(1);

		const failure = await splitSequencesHandler(
			getHandlerOptions({
				input: {
					sequences: [
						{
							fileName: entryPoint,
							nodePath: lineContainingToNodePath(input, 'name="one"'),
							sequenceKeys: sequenceTimingKeys,
							splitFrame: 0,
						},
					],
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
