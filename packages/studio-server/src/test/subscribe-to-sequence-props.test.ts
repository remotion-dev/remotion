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

// Mirrors the payload that Remotion Studio sends when mounting a composition
// with many interactive elements: one batched request per rendered element.
test('handles a batch of 1000 subscriptions from a large file quickly', async () => {
	const spanCount = 1000;
	const spans = Array.from(
		{length: spanCount},
		(_, i) =>
			`\t\t\t<Interactive.Span name="Line ${i + 1}">Line ${i + 1}</Interactive.Span>`,
	).join('\n');
	const input = `import {Interactive} from 'remotion';

const InteractiveDivStressTest: React.FC = () => {
	return (
		<Interactive.Div style={{backgroundColor: 'white', overflow: 'auto'}}>
${spans}
		</Interactive.Div>
	);
};

export default InteractiveDivStressTest;
`;
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const remotionRoot = mkdtempSync(join(tmpdir(), 'remotion-subscriptions-'));
	const uniqueSuffix = basename(remotionRoot);
	const fileName = `StressTest-${uniqueSuffix}.tsx`;
	const clientId = `subscription-stress-test-${uniqueSuffix}`;
	writeFileSync(join(remotionRoot, fileName), input);
	// The keys the Studio timeline subscribes to for Interactive.Span
	const keys = [
		'name',
		'durationInFrames',
		'from',
		'trimBefore',
		'freeze',
		'hidden',
		'showInTimeline',
		'style.transformOrigin',
		'style.translate',
		'style.scale',
		'style.rotate',
		'style.opacity',
		'cropLeft',
		'cropRight',
		'cropTop',
		'cropBottom',
		'style.backgroundColor',
		'style.borderWidth',
		'style.borderStyle',
		'style.borderColor',
		'style.borderRadius',
		'style.borderTopLeftRadius',
		'style.borderTopRightRadius',
		'style.borderBottomRightRadius',
		'style.borderBottomLeftRadius',
		'style.color',
		'style.fontFamily',
		'style.fontSize',
		'style.lineHeight',
		'style.fontWeight',
		'style.fontStyle',
		'style.textAlign',
		'style.letterSpacing',
		'children',
	];
	const requests: SubscribeToSequencePropsRequest[] = Array.from(
		{length: spanCount},
		(_, i) => ({
			fileName,
			// Spans start at line 6 of the generated file
			line: 6 + i,
			column: 3,
			nodePath: null,
			componentIdentity: 'dev.remotion.remotion.Interactive.Span',
			keys,
			assetKeys: [],
			effects: [],
			clientId,
			videoConfigValues: {
				durationInFrames: 120,
				fps: 30,
				height: 1080,
				width: 1080,
			},
		}),
	);

	try {
		const start = performance.now();
		const response = await subscribeToSequenceProps({
			binariesDirectory: null,
			configFile: null,
			entryPoint: join(remotionRoot, fileName),
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
		const durationMs = performance.now() - start;

		expect(response.results).toHaveLength(spanCount);
		for (const [index, result] of response.results.entries()) {
			if (!result.success) {
				throw new Error(`Subscription ${index} failed`);
			}

			expect(result.status.props.name).toEqual({
				status: 'static',
				keyframeDisplayOffsetAdjustment: null,
				codeValue: `Line ${index + 1}`,
			});
			expect(result.status.props.children).toEqual({
				status: 'static',
				keyframeDisplayOffsetAdjustment: null,
				codeValue: `Line ${index + 1}`,
			});
		}

		expect(durationMs).toBeLessThan(3000);
	} finally {
		unsubscribeClientSequencePropsWatchers(clientId);
		cleanupFileWatcher();
		rmSync(remotionRoot, {recursive: true, force: true});
	}
});
