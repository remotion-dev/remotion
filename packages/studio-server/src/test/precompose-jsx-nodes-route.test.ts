import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {precomposeJsxNodesHandler} from '../preview-server/routes/precompose-jsx-nodes';
import {clearUndoStackForTests} from '../preview-server/undo-stack';
import {lineContainingToNodePath} from './test-utils';

const videoSource = `import {Sequence} from 'remotion';

const Title = () => <div>Title</div>;
const trim = () => 3;

export const Video = () => (
	<>
		<Title />
		<Sequence name="Chart title" durationInFrames={60}>
			<div>Chart</div>
		</Sequence>
		<Sequence name="Dynamic" durationInFrames={trim()}>
			<div>Dynamic</div>
		</Sequence>
	</>
);
`;

const rootSource = `import {Composition} from 'remotion';
import {Video} from './Video';

export const Root = () => (
	<Composition id="Main" component={Video} durationInFrames={300} fps={30} width={1920} height={1080} />
);
`;

test('pre-compose route suggests a name, reports name conflicts and applies a requested name', async () => {
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
	const remotionRoot = mkdtempSync(join(tmpdir(), 'remotion-precompose-'));
	const videoPath = join(remotionRoot, 'Video.tsx');
	const rootPath = join(remotionRoot, 'Root.tsx');
	writeFileSync(videoPath, videoSource);
	writeFileSync(rootPath, rootSource);
	const precompose = (
		search: string,
		name: {compositionId: string; componentName: string} | null,
		dryRun: boolean,
	) =>
		precomposeJsxNodesHandler({
			binariesDirectory: null,
			configFile: null,
			entryPoint: rootPath,
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
			logLevel: 'error',
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: remotionRoot,
			remotionRoot,
			request: {} as never,
			response: {} as never,
			input: {
				nodes: [
					{
						fileName: 'Video.tsx',
						nodePath: lineContainingToNodePath(videoSource, search),
					},
				],
				compositionFile: 'Root.tsx',
				compositionId: 'Main',
				existingCompositionIds: ['Main'],
				metadata: {width: 1920, height: 1080, fps: 30, durationInFrames: 300},
				name,
				dryRun,
			},
		});

	try {
		expect(await precompose('name="Dynamic"', null, true)).toMatchObject({
			success: true,
			canPrecompose: false,
			invalidName: false,
		});
		expect(await precompose('name="Chart title"', null, true)).toEqual({
			success: true,
			canPrecompose: true,
			reason: null,
			invalidName: false,
			nodePathMutation: null,
			newCompositionId: 'ChartTitle',
		});
		expect(
			await precompose(
				'name="Chart title"',
				{compositionId: 'title', componentName: 'Title'},
				false,
			),
		).toEqual({
			success: true,
			canPrecompose: false,
			reason:
				'The component name "Title" is already used in this file. Choose a different ID.',
			invalidName: true,
			nodePathMutation: null,
			newCompositionId: null,
		});
		expect(readFileSync(videoPath, 'utf-8')).toBe(videoSource);
		expect(readFileSync(rootPath, 'utf-8')).toBe(rootSource);

		expect(
			await precompose(
				'name="Chart title"',
				{compositionId: 'chart-title', componentName: 'ChartTitle'},
				false,
			),
		).toMatchObject({
			success: true,
			canPrecompose: true,
			invalidName: false,
			newCompositionId: 'chart-title',
		});
		expect(readFileSync(videoPath, 'utf-8')).toContain(
			'<ChartTitle name={"Chart title"} />',
		);
		const root = readFileSync(rootPath, 'utf-8');
		expect(root).toContain('id="chart-title"');
		expect(root).toContain('component={ChartTitle}');
	} finally {
		cleanupLiveEvents();
		cleanupFileWatcher();
		clearUndoStackForTests();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
