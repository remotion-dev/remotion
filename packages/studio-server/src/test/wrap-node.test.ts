import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {wrapNodeHandler} from '../preview-server/routes/wrap-node';
import {clearUndoStackForTests} from '../preview-server/undo-stack';
import {lineContainingToNodePath} from './test-utils';

test('wrapping JSX writes the child on a new line with aligned indentation', async () => {
	clearUndoStackForTests();
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-wrap-jsx-'));
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		sendEventToClient: () => undefined,
		sendEventToClientId: () => true,
		router: () => Promise.resolve(),
		closeConnections: () => Promise.resolve(),
		getClientIds: () => [],
		addNewClientListener: () => () => undefined,
	});

	try {
		const entryPoint = path.join(remotionRoot, 'NewComposition.tsx');
		const compositionId = 'MyComp';
		const input = `import {Sequence, HtmlInCanvas} from 'remotion';

export const Comp = ({portrait}: {portrait: boolean}) => {
	return (
        <Sequence
                width={portrait ? 1080 : 960}
                height={portrait ? 960 : 1080}
                style={{left: 24, top: 0, opacity: 0.5}}
            >
                <div data-role="child" />
            </Sequence>
	);
};
`;
		writeFileSync(entryPoint, input);

		const result = await wrapNodeHandler({
			input: {
				fileName: entryPoint,
				compositionId,
				nodePath: lineContainingToNodePath(input, '<Sequence'),
				wrapper: 'HtmlInCanvas',
				measuredSize: null,
				timing: {
					from: 10,
					durationInFrames: 30,
					trimBefore: 10,
				},
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

		const output = readFileSync(entryPoint, 'utf-8');
		expect(result).toMatchObject({
			success: true,
			nodePathMutation: {
				timelineSelection: {
					compositionId,
					absolutePath: entryPoint,
					nodePath: lineContainingToNodePath(output, '<HtmlInCanvas'),
				},
			},
		});
		expect(output).toContain(
			[
				'        <HtmlInCanvas',
				'            width={portrait ? 1080 : 960}',
				'            height={portrait ? 960 : 1080}',
				'            from={10}',
				'            durationInFrames={30}',
				'            trimBefore={10}',
				"            style={{position: 'absolute', left: 24, top: 0}}",
				'        >',
				'            <Sequence',
				'                width={portrait ? 1080 : 960}',
				'                height={portrait ? 960 : 1080}',
				'                style={{opacity: 0.5}}',
				'            >',
				'                <div data-role="child" />',
				'            </Sequence>',
				'        </HtmlInCanvas>',
			].join('\n'),
		);
	} finally {
		clearUndoStackForTests();
		cleanupFileWatcher();
		cleanupLiveEvents();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
