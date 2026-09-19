import {expect, test} from 'bun:test';
import {
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {CodeModsInternals} from '@remotion/codemods';
import {insertBasicCaptions} from '../codemods/insert-basic-captions';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {insertBasicCaptionsHandler} from '../preview-server/routes/insert-basic-captions';
import {getUndoStack} from '../preview-server/undo-stack';
import {lineContainingToNodePath} from './test-utils';

const {basicCaptionsElementSource, getBasicCaptionsElementFile} =
	CodeModsInternals;

test('transcription inserts inline Basic captions beside selected Video and Audio tags', async () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-captions-'));
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
	const captions = [
		{
			text: ' Hello',
			startMs: 100,
			endMs: 400,
			timestampMs: 250,
			confidence: null,
		},
	];

	try {
		(getUndoStack() as unknown as unknown[]).length = 0;
		writeFileSync(
			entryPoint,
			`import {Video, Audio} from '@remotion/media';

export const Comp = () => (
	<>
		<Video src="video.mp4" from={10} trimBefore={5} playbackRate={2} />
		<Audio src="voice.mp3" durationInFrames={60} />
	</>
);
`,
		);

		for (const [tag, durationInFrames] of [
			['<Video', 90],
			['<Audio', 60],
		] as const) {
			const current = readFileSync(entryPoint, 'utf-8');
			const result = await insertBasicCaptionsHandler({
				input: {
					fileName: entryPoint,
					nodePath: lineContainingToNodePath(current, tag),
					captions,
					durationInFrames,
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
		}

		const written = readFileSync(entryPoint, 'utf-8');
		expect(written).toContain(
			`import {BasicCaptions} from './basic-captions.element';`,
		);
		expect(written).not.toContain('@remotion/captions/basic-captions');
		expect(
			readFileSync(
				path.join(remotionRoot, 'basic-captions.element.tsx'),
				'utf-8',
			),
		).toBe(basicCaptionsElementSource);
		expect(basicCaptionsElementSource).toContain(
			"import {createTikTokStyleCaptions} from '@remotion/captions';",
		);
		expect(
			readdirSync(remotionRoot).filter((file) => file.endsWith('.element.tsx')),
		).toEqual(['basic-captions.element.tsx']);
		expect(written.match(/<BasicCaptions/g)).toHaveLength(2);
		expect(written).toContain('"text": " Hello"');
		expect(written.replace(/\s+/g, ' ')).toContain(
			'<BasicCaptions captions={[',
		);
		expect(written).toContain('trimBefore={5} playbackRate={2}');
		expect(written).toContain('durationInFrames={90}');
		expect(written).toContain('durationInFrames={60}');
		expect(getUndoStack()).toHaveLength(2);
	} finally {
		cleanupFileWatcher();
		cleanupLiveEvents();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});

test('wraps a root Audio in a fragment when adding captions', () => {
	const input = `import {Audio} from 'remotion';
export const Comp = () => <Audio src="voice.mp3" />;`;
	const {output} = insertBasicCaptions({
		input,
		nodePath: lineContainingToNodePath(input, '<Audio'),
		captions: [
			{
				text: ' Hello',
				startMs: 0,
				endMs: 500,
				timestampMs: null,
				confidence: null,
			},
		],
		durationInFrames: 30,
	});

	expect(output).toContain('<>');
	expect(output).toContain('<Audio src="voice.mp3" />');
	expect(output).toContain('<BasicCaptions captions={[');
	expect(output).toContain('durationInFrames={30}');
});

test('keeps edited Basic captions source and adds another instance for the same clip', () => {
	const customizedSource = basicCaptionsElementSource.replace(
		'bottom: 120',
		'bottom: 90',
	);
	const localElement = getBasicCaptionsElementFile({
		fileName: '/project/Comp.tsx',
		readFileContents: (candidate) =>
			candidate === '/project/basic-captions.element.tsx'
				? customizedSource
				: null,
	});
	expect(localElement).toEqual({
		fileName: '/project/basic-captions.element.tsx',
		importPath: './basic-captions.element',
		shouldWrite: false,
	});

	const input = `import {Audio} from 'remotion';
export const Comp = () => <Audio src="voice.mp3" />;`;
	const captions = [
		{
			text: ' Hello',
			startMs: 0,
			endMs: 500,
			timestampMs: null,
			confidence: null,
		},
	];
	const first = insertBasicCaptions({
		input,
		nodePath: lineContainingToNodePath(input, '<Audio'),
		captions,
		durationInFrames: 30,
		importPath: localElement.importPath,
	});
	const second = insertBasicCaptions({
		input: first.output,
		nodePath: lineContainingToNodePath(first.output, '<Audio'),
		captions,
		durationInFrames: 30,
		importPath: localElement.importPath,
	});
	expect(second.output.match(/<BasicCaptions captions/g)).toHaveLength(2);
	expect(second.output.match(/import \{BasicCaptions\}/g)).toHaveLength(1);
});
