import {expect, test} from 'bun:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {basename, join} from 'node:path';
import type {SubscribeToSequencePropsRequest} from '@remotion/studio-shared';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {subscribeToSequenceProps} from '../preview-server/routes/subscribe-to-sequence-props';
import {unsubscribeClientSequencePropsWatchers} from '../preview-server/sequence-props-watchers';
import {lineColumnToNodePath} from './test-utils';

test('resolves batched sequence prop subscriptions through the handler', async () => {
	const firstInput = `import {Interactive} from 'remotion';

export const First = () => {
	return (
		<>
			<Interactive.Div name="One" />
			<Interactive.Div name="Two" />
		</>
	);
};
`;
	const secondInput = `import {Interactive} from 'remotion';

export const Second = () => {
	return <Interactive.Div name="Three" />;
};
`;
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const remotionRoot = mkdtempSync(join(tmpdir(), 'remotion-subscriptions-'));
	const uniqueSuffix = basename(remotionRoot);
	const firstFileName = `First-${uniqueSuffix}.tsx`;
	const secondFileName = `Second-${uniqueSuffix}.tsx`;
	const clientId = `subscription-test-${uniqueSuffix}`;
	writeFileSync(join(remotionRoot, firstFileName), firstInput);
	writeFileSync(join(remotionRoot, secondFileName), secondInput);
	const videoConfigValues = {
		durationInFrames: 100,
		fps: 30,
		height: 1080,
		width: 1920,
	};
	const requestBase = {
		column: 0,
		componentIdentity: 'dev.remotion.remotion.Interactive.Div',
		keys: ['name'],
		assetKeys: [],
		effects: [],
		clientId,
		videoConfigValues,
	} satisfies Omit<
		SubscribeToSequencePropsRequest,
		'fileName' | 'line' | 'nodePath'
	>;
	const requests: SubscribeToSequencePropsRequest[] = [
		{
			...requestBase,
			fileName: firstFileName,
			line: 6,
			nodePath: null,
		},
		{
			...requestBase,
			fileName: firstFileName,
			line: 7,
			nodePath: null,
		},
		{
			...requestBase,
			fileName: secondFileName,
			line: 4,
			nodePath: null,
		},
		{
			...requestBase,
			fileName: secondFileName,
			line: 4,
			nodePath: lineColumnToNodePath(secondInput, 4),
		},
	];

	try {
		const response = await subscribeToSequenceProps({
			binariesDirectory: null,
			configFile: null,
			entryPoint: join(remotionRoot, firstFileName),
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
			input: {...requests[0], requests},
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
		});
		const expectedNodePaths = [
			lineColumnToNodePath(firstInput, 6),
			lineColumnToNodePath(firstInput, 7),
			lineColumnToNodePath(secondInput, 4),
			lineColumnToNodePath(secondInput, 4),
		];
		const expectedNames = ['One', 'Two', 'Three', 'Three'];
		expect(response.results).toHaveLength(requests.length);
		for (const [index, result] of response.results.entries()) {
			if (!result.success) {
				throw new Error(`Subscription ${index} failed`);
			}

			expect(result.nodePath.nodePath).toEqual(expectedNodePaths[index]);
			expect(result.status.props.name).toEqual({
				status: 'static',
				keyframeDisplayOffsetAdjustment: null,
				codeValue: expectedNames[index],
			});
		}
	} finally {
		unsubscribeClientSequencePropsWatchers(clientId);
		cleanupFileWatcher();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
