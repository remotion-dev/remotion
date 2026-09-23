import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {wrapJsxNodeHandler} from '../preview-server/routes/wrap-jsx-node';
import {getUndoStack} from '../preview-server/undo-stack';
import {lineContainingToNodePath} from './test-utils';

test('wrapping JSX writes the child on a new line with aligned indentation', async () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-wrap-jsx-'));
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
		(getUndoStack() as unknown as unknown[]).length = 0;
		const entryPoint = path.join(remotionRoot, 'NewComposition.tsx');
		const input = `import {AbsoluteFill, HtmlInCanvas} from 'remotion';

export const Comp = () => {
	return (
        <AbsoluteFill
                style={{width: 2560, height: 1248}}
            >
                <div data-role="child" />
            </AbsoluteFill>
	);
};
`;
		writeFileSync(entryPoint, input);

		const result = await wrapJsxNodeHandler({
			input: {
				fileName: entryPoint,
				nodePath: lineContainingToNodePath(input, '<AbsoluteFill'),
				wrapper: 'HtmlInCanvas',
				width: 2560,
				height: 1248,
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
		expect(readFileSync(entryPoint, 'utf-8'))
			.toContain(`        <HtmlInCanvas width={2560} height={1248}>
            <AbsoluteFill
                style={{width: 2560, height: 1248}}
            >
                <div data-role="child" />
            </AbsoluteFill>
        </HtmlInCanvas>`);
	} finally {
		cleanupFileWatcher();
		cleanupLiveEvents();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
