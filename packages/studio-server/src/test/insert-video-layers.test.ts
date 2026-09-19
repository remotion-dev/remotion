import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {insertVideoLayersHandler} from '../preview-server/routes/insert-video-layers';
import {getUndoStack} from '../preview-server/undo-stack';
import {lineContainingToNodePath} from './test-utils';

test('video matting inserts base and foreground videos through the Studio route', async () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-matting-'));
	const entryPoint = path.join(remotionRoot, 'Root.tsx');
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
	const input = `import {Video as Clip} from '@remotion/media';

const source = 'input.mp4';
const untouched  = {keep : 'spacing'};

export const Comp = () => (
	<Clip
		src={source}
		from={10}
		style={{opacity: 0.5}}
	/>
);
`;

	try {
		(getUndoStack() as unknown as unknown[]).length = 0;
		writeFileSync(entryPoint, input);
		const result = await insertVideoLayersHandler({
			input: {
				fileName: entryPoint,
				nodePath: lineContainingToNodePath(input, '<Clip'),
				baseSrc: 'input-base.webm',
				foregroundSrc: 'input-foreground.webm',
			},
			entryPoint,
			remotionRoot,
			request: {} as never,
			response: {} as never,
			logLevel: 'error',
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

		expect(result.success).toBe(true);
		const written = readFileSync(entryPoint, 'utf-8');
		const singleLine = written.replace(/\s+/g, ' ');
		expect(written).toContain(`import {staticFile} from 'remotion';`);
		expect(singleLine).toContain(
			"<Clip src={staticFile('input-base.webm')} from={10} style={{opacity: 0.5}} />",
		);
		expect(singleLine).toContain(
			"<Clip src={staticFile('input-foreground.webm')} from={10} style={{opacity: 0.5}} />",
		);
		expect(written).toContain("const untouched  = {keep : 'spacing'};");
		expect(getUndoStack()).toHaveLength(1);
	} finally {
		cleanupFileWatcher();
		cleanupLiveEvents();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
