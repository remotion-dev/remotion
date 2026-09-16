import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {splitVideoFromAudio} from '../codemods/split-video-from-audio';
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

const split = async (element: string, imports?: string) => {
	const input = wrap(element, imports);
	const {output} = await splitVideoFromAudio({
		input,
		nodePath: lineContainingToNodePath(input, element),
	});

	return output;
};

test('splitVideoFromAudio mutes the video and adds an Audio with the same timing', async () => {
	const output = await split(
		'<Video src="video.mp4" from={10} durationInFrames={50} trimBefore={5} playbackRate={2} volume={0.5} style={{opacity: 0.5}} />',
	);

	const singleLine = output.replace(/\s+/g, ' ');

	expect(output).toContain(`import {Video, Audio} from '@remotion/media';`);
	expect(singleLine).toContain(
		'<Video src="video.mp4" from={10} durationInFrames={50} trimBefore={5} playbackRate={2} volume={0.5} style={{opacity: 0.5}} muted />',
	);
	expect(singleLine).toContain(
		'<Audio src="video.mp4" from={10} durationInFrames={50} trimBefore={5} playbackRate={2} volume={0.5} />',
	);
});

test('splitVideoFromAudio preserves unrelated source formatting without calling the formatter', async () => {
	const input = `import{Video}from"@remotion/media"

const untouched  = {keep : "spacing"}
export const Comp=()=>(
  <>
    <Video
      src = {"video.mp4"}
      from = {10}
      style = {{opacity:.5}}
    />
    <div  data-value = "unchanged"/>
  </>
)
`;
	let formatCalls = 0;
	const {formatted, nodePathRemappings, output} = await splitVideoFromAudio({
		input,
		nodePath: lineContainingToNodePath(input, '<Video'),
		formatFile: () => {
			formatCalls++;
			throw new Error('Prettier must not be called');
		},
	});

	expect(formatCalls).toBe(0);
	expect(formatted).toBe(true);
	expect(output).toBe(`import{Video, Audio}from"@remotion/media"

const untouched  = {keep : "spacing"}
export const Comp=()=>(
  <>
    <Video
      src = {"video.mp4"}
      from = {10}
      style = {{opacity:.5}}
      muted
    />
    <Audio src = {"video.mp4"} from = {10} />
    <div  data-value = "unchanged"/>
  </>
)
`);
	expect(nodePathRemappings).toEqual([
		{
			oldNodePath: lineContainingToNodePath(input, '<Video'),
			newNodePath: lineContainingToNodePath(output, '<Video'),
		},
		{
			oldNodePath: lineContainingToNodePath(input, '<div'),
			newNodePath: lineContainingToNodePath(output, '<div'),
		},
		{
			oldNodePath: null,
			newNodePath: lineContainingToNodePath(output, '<Audio'),
		},
	]);
});

test('splitVideoFromAudio does not copy non-audio props', async () => {
	const output = await split(
		'<Video src="video.mp4" name="my video" freeze={20} crop={{x: 0, y: 0, width: 100, height: 100}} />',
	);

	expect(output).toContain('<Audio src="video.mp4" />');
});

test('splitVideoFromAudio wraps a root video in a fragment', async () => {
	const input = `import {Video} from '@remotion/media';

export const Comp = () => <Video src="video.mp4" />;
`;
	const {output} = await splitVideoFromAudio({
		input,
		nodePath: lineContainingToNodePath(input, '<Video'),
	});

	expect(output).toBe(`import {Video, Audio} from '@remotion/media';

export const Comp = () => <>
  <Video src="video.mp4" muted />
  <Audio src="video.mp4" />
</>;
`);
});

test('splitVideoFromAudio preserves CRLF and tab indentation', async () => {
	const input = [
		`import {Video} from '@remotion/media';`,
		'',
		'export const Comp = () => {',
		'\treturn (',
		'\t\t<>',
		'\t\t\t<Video',
		'\t\t\t\tsrc="video.mp4"',
		'\t\t\t\ttrimBefore={10}',
		'\t\t\t/>',
		'\t\t</>',
		'\t);',
		'};',
		'',
	].join('\r\n');
	const {output} = await splitVideoFromAudio({
		input,
		nodePath: lineContainingToNodePath(input, '<Video'),
	});

	expect(output).toBe(
		[
			`import {Video, Audio} from '@remotion/media';`,
			'',
			'export const Comp = () => {',
			'\treturn (',
			'\t\t<>',
			'\t\t\t<Video',
			'\t\t\t\tsrc="video.mp4"',
			'\t\t\t\ttrimBefore={10}',
			'\t\t\t\tmuted',
			'\t\t\t/>',
			'\t\t\t<Audio src="video.mp4" trimBefore={10} />',
			'\t\t</>',
			'\t);',
			'};',
			'',
		].join('\r\n'),
	);
});

test('splitVideoFromAudio replaces an existing muted prop', async () => {
	const output = await split('<Video src="video.mp4" muted={false} />');

	expect(output).toContain('<Video src="video.mp4" muted />');
	expect(output).not.toContain('muted={false}');
});

test('splitVideoFromAudio reuses an existing Audio import', async () => {
	const output = await split(
		'<Video src="video.mp4" />',
		`import {Audio, Video} from '@remotion/media';`,
	);

	expect(output).toContain(`import {Audio, Video} from '@remotion/media';`);
	expect(output.match(/from '@remotion\/media'/g)?.length).toBe(1);
});

test('splitVideoFromAudio uses an aliased Audio import', async () => {
	const output = await split(
		'<Video src="video.mp4" />',
		`import {Audio as Sound, Video} from '@remotion/media';`,
	);

	expect(output).toContain(
		`import {Audio as Sound, Video} from '@remotion/media';`,
	);
	expect(output).toContain('<Sound src="video.mp4" />');
});

test('splitVideoFromAudio imports Audio from the same module as the tag', async () => {
	const output = await split(
		'<OffthreadVideo src="video.mp4" from={5} />',
		`import {OffthreadVideo} from 'remotion';`,
	);

	expect(output).toContain(`import {OffthreadVideo, Audio} from 'remotion';`);
	expect(output).toContain('<OffthreadVideo src="video.mp4" from={5} muted />');
	expect(output).toContain('<Audio src="video.mp4" from={5} />');
});

test('splitVideoFromAudio follows import aliases', async () => {
	const output = await split(
		'<V src="video.mp4" />',
		`import {Video as V} from '@remotion/media';`,
	);

	expect(output).toContain(
		`import {Video as V, Audio} from '@remotion/media';`,
	);
	expect(output).toContain('<Audio src="video.mp4" />');
});

test('splitVideoFromAudio rejects elements without a src attribute', async () => {
	await expect(split('<Video from={0} />')).rejects.toThrow(
		'<Video> has no src attribute',
	);
});

test('splitVideoFromAudio rejects unimported tags', async () => {
	await expect(split('<video src="video.mp4" />')).rejects.toThrow(
		'Could not find the import of <video>',
	);
});

test('splitVideoFromAudio rejects an Audio import from another module', async () => {
	await expect(
		split(
			'<Video src="video.mp4" />',
			`import {Video} from '@remotion/media';\nimport {Audio} from 'remotion';`,
		),
	).rejects.toThrow('Audio is already imported from "remotion"');
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
