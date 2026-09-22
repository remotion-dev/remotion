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
		for (const {source, base, foreground} of [
			{
				source: input,
				base: "<Clip src={staticFile('input-base.webm')} from={10} style={{opacity: 0.5}} />",
				foreground:
					"<Clip src={staticFile('input-foreground.webm')} from={10} style={{opacity: 0.5, position: 'absolute', top: 0, left: 0}} />",
			},
			{
				source: input.replace('\t\tstyle={{opacity: 0.5}}\n', ''),
				base: "<Clip src={staticFile('input-base.webm')} from={10} />",
				foreground:
					"<Clip src={staticFile('input-foreground.webm')} from={10} style={{position: 'absolute', top: 0, left: 0}} />",
			},
			{
				source: input.replace(
					'style={{opacity: 0.5}}',
					'style={{\n\t\t\topacity: 0.5,\n\t\t}}',
				),
				base: "<Clip src={staticFile('input-base.webm')} from={10} style={{ opacity: 0.5, }} />",
				foreground:
					"<Clip src={staticFile('input-foreground.webm')} from={10} style={{ opacity: 0.5, position: 'absolute', top: 0, left: 0, }} />",
			},
			{
				source: input.replace(
					'style={{opacity: 0.5}}',
					"style={{position: 'absolute', top: 10, left: 20, opacity: 0.5}}",
				),
				base: "<Clip src={staticFile('input-base.webm')} from={10} style={{position: 'absolute', top: 10, left: 20, opacity: 0.5}} />",
				foreground:
					"<Clip src={staticFile('input-foreground.webm')} from={10} style={{top: 0, left: 0, ...({position: 'absolute', top: 10, left: 20, opacity: 0.5}), position: 'absolute'}} />",
			},
		]) {
			writeFileSync(entryPoint, source);
			const result = await insertVideoLayersHandler({
				input: {
					fileName: entryPoint,
					nodePath: lineContainingToNodePath(source, '<Clip'),
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
			expect(singleLine).toContain(base);
			expect(singleLine).toContain(foreground);
			expect(written).toContain("const untouched  = {keep : 'spacing'};");
		}

		expect(getUndoStack()).toHaveLength(4);
	} finally {
		cleanupFileWatcher();
		cleanupLiveEvents();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
