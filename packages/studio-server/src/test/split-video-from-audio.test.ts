import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {splitVideoFromAudioHandler} from '../preview-server/routes/split-video-from-audio';
import {getUndoStack} from '../preview-server/undo-stack';
import {lineColumnToNodePath, lineContainingToNodePath} from './test-utils';

const wrap = (
	element: string,
	imports = `import {Video} from '@remotion/media';`,
) => `${imports}

export const Comp = () => {
	return (
		<>
			${element}
		</>
	);
};
`;

const elementLine = 6;

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

test('splitVideoFromAudioHandler writes success and failure responses', async () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-split-av-'));
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
			'<Video src="video.mp4" from={0} trimBefore={10} />',
		).replace(
			'\n\nexport const Comp',
			'\n\nconst untouched  =  { value : "keep" };\n\nexport const Comp',
		);
		writeFileSync(entryPoint, input);

		const success = await splitVideoFromAudioHandler(
			getHandlerOptions({
				input: {
					fileName: entryPoint,
					nodePath: lineContainingToNodePath(input, '<Video'),
				},
				entryPoint,
				remotionRoot,
			}),
		);

		expect(success.success).toBe(true);
		const written = readFileSync(entryPoint, 'utf-8');
		expect(written).toContain(
			'<Video src="video.mp4" from={0} trimBefore={10} muted />',
		);
		expect(written).toContain(
			'<Audio src="video.mp4" from={0} trimBefore={10} />',
		);
		expect(written).toContain('const untouched  =  { value : "keep" };');
		expect(getUndoStack().length).toBe(1);

		const failureInput = wrap('<Video from={0} />');
		writeFileSync(entryPoint, failureInput);
		const failure = await splitVideoFromAudioHandler(
			getHandlerOptions({
				input: {
					fileName: entryPoint,
					nodePath: lineColumnToNodePath(failureInput, elementLine),
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
