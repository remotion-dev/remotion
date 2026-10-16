import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {CodemodsInternals} from '@remotion/codemods';
import type {
	SubscribeToSequencePropsBatchRequest,
	UnsubscribeFromSequencePropsBatchRequest,
	UnsubscribeFromSequencePropsRequest,
} from '@remotion/studio-shared';
import {act, render, waitFor} from '@testing-library/react';
import {useContext, useState, type ContextType} from 'react';
import {
	Internals,
	Sequence,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ExpandedTracksProvider} from '../components/ExpandedTracksProvider';
import {SequencePropsSubscriptionProvider} from '../components/SequencePropsSubscriptionProvider';
import {shouldSubscribeToSequenceProps} from '../components/Timeline/should-subscribe-to-sequence-props';
import {SubscribeToNodePaths} from '../components/Timeline/SubscribeToNodePaths';
import {StudioServerConnectionCtx} from '../helpers/client-id';

const fileName = __filename;
const source = readFileSync(fileName, 'utf8').split('\ntest(')[0];
let sourceLineOffset = 0;

// Supply the source locations normally injected by the Studio bundler. The
// subscription parser reads the same JSX that React mounts below.
const sourceProps = (name: string) => {
	const attribute = source.indexOf('name="' + name + '"');
	const opening = source.lastIndexOf('<Sequence', attribute);
	return {
		[Internals.REMOTION_INTERNAL_STACK_PROP]: Internals.makeOriginalSourceStack(
			{
				fileName,
				lineNumber:
					source.slice(0, opening).split('\n').length + sourceLineOffset,
				columnNumber: 0,
			},
		),
	};
};

const Readout = ({label}: {readonly label: string}) => (
	<div data-testid={label}>{useVideoConfig().durationInFrames}</div>
);

const Expression = ({label}: {readonly label: string}) => {
	const {durationInFrames: duration} = useVideoConfig();
	const frame = useCurrentFrame();
	return (
		<Sequence
			{...sourceProps('Expression')}
			name="Expression"
			durationInFrames={duration * 0.5}
			style={{opacity: interpolate(frame, [0, duration - 1], [0, 1])}}
		>
			<Readout label={label} />
		</Sequence>
	);
};

const Fixture = () => (
	<>
		<Sequence {...sourceProps('Parent')} name="Parent" durationInFrames={300}>
			<Readout label="parent" />
			<Sequence
				{...sourceProps('Literal')}
				name="Literal"
				durationInFrames={180}
			>
				<Readout label="literal" />
			</Sequence>
			<Expression label="A" />
		</Sequence>
		<Sequence durationInFrames={400}>
			<Expression label="B" />
		</Sequence>
		<Sequence {...sourceProps('Root')} name="Root" durationInFrames={180}>
			<Readout label="root" />
		</Sequence>
	</>
);

test('parent previews keep source subscriptions stable while mounted instances evaluate shared source', async () => {
	const previousFetch = globalThis.fetch;
	const requests: string[] = [];
	const unsubscriptionBatches: UnsubscribeFromSequencePropsRequest[][] = [];
	const subscriptions: ReturnType<
		typeof CodemodsInternals.computeSequencePropsSubscriptionFromContent
	>[] = [];
	let subscriptionSource = source;
	let refreshFixture: () => void = () => {
		throw new Error('Fixture has not mounted');
	};

	const RefreshableFixture = () => {
		const [, setRevision] = useState(0);
		refreshFixture = () => setRevision((revision) => revision + 1);
		return <Fixture />;
	};

	const setters: {
		current: ContextType<typeof Internals.VisualModeSettersContext> | null;
	} = {current: null};

	// Only the HTTP transport is replaced. Source parsing, subscription lifecycle,
	// registration, drag overrides, and rendered expressions use production code.
	// The reduced E2E covers the actual server, source writes, and refresh.
	globalThis.fetch = ((input, init) => {
		const endpoint = String(input);
		requests.push(endpoint);
		if (endpoint === '/api/unsubscribe-from-sequence-props') {
			const unsubscribeBody = JSON.parse(
				String(init?.body),
			) as UnsubscribeFromSequencePropsBatchRequest;
			unsubscriptionBatches.push(unsubscribeBody.requests);
			return Promise.resolve(Response.json({success: true}));
		}

		if (endpoint !== '/api/subscribe-to-sequence-props') {
			throw new Error(`Unexpected request: ${endpoint}`);
		}

		const body = JSON.parse(
			String(init?.body),
		) as SubscribeToSequencePropsBatchRequest;
		const results = body.requests.map((request) =>
			CodemodsInternals.computeSequencePropsSubscriptionFromContent({
				fileContents: subscriptionSource,
				absolutePath: fileName,
				line: request.line,
				preferredNodePath: request.nodePath,
				componentIdentity: request.componentIdentity,
				keys: request.keys,
				assetKeys: request.assetKeys,
				effects: request.effects,
			}),
		);
		subscriptions.push(...results);
		return Promise.resolve(Response.json({success: true, data: {results}}));
	}) as typeof fetch;

	const Subscriptions = () => {
		const sequences = Internals.useSequenceManagerSequences();
		setters.current = useContext(Internals.VisualModeSettersContext);
		return sequences.map((sequence) =>
			shouldSubscribeToSequenceProps(sequence, true) ? (
				<SubscribeToNodePaths
					key={sequence.id}
					overrideId={sequence.controls.overrideId}
					componentIdentity={sequence.controls.componentIdentity}
					schema={sequence.controls.schema}
					getStack={sequence.getStack}
					effects={sequence.effects}
				/>
			) : null,
		);
	};

	const metadata = {
		durationInFrames: 600,
		fps: 30,
		width: 1280,
		height: 720,
		props: {},
		defaultCodec: null,
		defaultOutName: null,
		defaultPixelFormat: null,
		defaultProResProfile: null,
		defaultSampleRate: null,
		defaultVideoImageFormat: null,
	};
	const timeline = {
		frame: {test: 30},
		isPlaying: () => false,
		isInsideFreeze: false,
		audioAndVideoTags: {current: []},
	};
	let rendered: ReturnType<typeof render> | null = null;
	try {
		rendered = render(
			<Internals.RemotionEnvironmentContext.Provider
				value={{
					isStudio: true,
					isPlayer: false,
					isRendering: false,
					isReadOnlyStudio: false,
					isClientSideRendering: false,
				}}
			>
				<Internals.CanUseRemotionHooksProvider>
					<Internals.CompositionManager.Provider
						value={{
							compositions: [
								{
									...metadata,
									id: 'test',
									component: Fixture,
									defaultProps: {},
									folderName: null,
									parentFolderName: null,
									order: null,
									calculateMetadata: null,
									schema: null,
									stack: null,
								},
							],
							folders: [],
							canvasContent: {type: 'composition', compositionId: 'test'},
							currentCompositionMetadata: metadata,
							currentAssetMetadata: null,
						}}
					>
						<Internals.VideoProvider>
							<Internals.AbsoluteTimeContext.Provider value={timeline}>
								<Internals.TimelineContext.Provider value={timeline}>
									<Internals.SequenceManagerProvider>
										<SequencePropsSubscriptionProvider>
											<ExpandedTracksProvider>
												<StudioServerConnectionCtx.Provider
													value={{
														previewServerState: {
															type: 'connected',
															clientId: 'test',
														},
														configFileChangeRevision: 0,
														restartRequired: false,
														subscribeToEvent: () => () => undefined,
													}}
												>
													<RefreshableFixture />
													<Subscriptions />
												</StudioServerConnectionCtx.Provider>
											</ExpandedTracksProvider>
										</SequencePropsSubscriptionProvider>
									</Internals.SequenceManagerProvider>
								</Internals.TimelineContext.Provider>
							</Internals.AbsoluteTimeContext.Provider>
						</Internals.VideoProvider>
					</Internals.CompositionManager.Provider>
				</Internals.CanUseRemotionHooksProvider>
			</Internals.RemotionEnvironmentContext.Provider>,
		);
		await waitFor(() => expect(subscriptions).toHaveLength(4));
		expect(subscriptions.every((result) => result.success)).toBe(true);
		const parent = subscriptions.find(
			(result) =>
				result.success &&
				result.status.props.name.status === 'static' &&
				result.status.props.name.codeValue === 'Parent',
		);
		const expression = subscriptions.find(
			(result) =>
				result.success &&
				result.status.props.name.status === 'static' &&
				result.status.props.name.codeValue === 'Expression',
		);
		if (!parent?.success || !expression?.success || !setters.current) {
			throw new Error('Expected source subscriptions and visual mode setters');
		}

		const initialRequests = [...requests];
		for (const previewDuration of [300, 320, 340, 360]) {
			act(() =>
				setters.current!.setDragOverrides(parent.nodePath, 'durationInFrames', {
					type: 'static',
					value: previewDuration,
				}),
			);
			// Flush React effects and the subscription batch scheduled for the next task.
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});
			expect(rendered.getByTestId('parent').textContent).toBe(
				String(previewDuration),
			);
			expect(rendered.getByTestId('A').textContent).toBe(
				String(previewDuration / 2),
			);
			expect(rendered.getByTestId('B').textContent).toBe('200');
			for (const label of ['literal', 'root']) {
				expect(rendered.getByTestId(label).textContent).toBe('180');
			}

			expect(
				Number(rendered.getByTestId('A').parentElement!.style.opacity),
			).toBeCloseTo(30 / (previewDuration - 1), 5);
			expect(
				Number(rendered.getByTestId('B').parentElement!.style.opacity),
			).toBeCloseTo(30 / 399, 5);
			expect(requests).toEqual(initialRequests);
		}

		// A source update must affect both instances without using either instance's
		// configuration as the shared value. No recompilation is needed to apply it.
		const updated =
			CodemodsInternals.computeSequencePropsSubscriptionFromContent({
				fileContents: source
					.replace('duration * 0.5', 'duration * 0.75')
					.replace('duration - 1', 'duration - 2'),
				absolutePath: fileName,
				line: 1,
				preferredNodePath: expression.nodePath.nodePath,
				componentIdentity: 'dev.remotion.remotion.Sequence',
				keys: expression.nodePath.sequenceKeys,
				effects: [],
			});
		if (!updated.success) throw new Error('Expected updated source');
		act(() =>
			setters.current!.setPropStatuses(updated.nodePath, () => updated.status),
		);
		expect(rendered.getByTestId('A').textContent).toBe('270');
		expect(rendered.getByTestId('B').textContent).toBe('300');
		expect(
			Number(rendered.getByTestId('A').parentElement!.style.opacity),
		).toBeCloseTo(30 / 358, 5);
		expect(
			Number(rendered.getByTestId('B').parentElement!.style.opacity),
		).toBeCloseTo(30 / 398, 5);
		expect(requests).toEqual(initialRequests);

		// Registration can publish a shifted source stack without another refresh
		// event. Updating that stack must still refresh source props.
		sourceLineOffset = 2;
		subscriptionSource = `\n\n${source}`;
		act(() => refreshFixture());
		await waitFor(() =>
			expect(rendered!.getByTestId('A').textContent).toBe('180'),
		);
		expect(rendered.getByTestId('B').textContent).toBe('200');
	} finally {
		await act(async () => {
			rendered?.unmount();
			await Promise.resolve();
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		globalThis.fetch = previousFetch;
		sourceLineOffset = 0;
	}

	// Refresh cleanup and final unmount each send one batch, preserving every release.
	expect(unsubscriptionBatches).toHaveLength(2);
	expect(unsubscriptionBatches.at(-1)).toHaveLength(4);
	expect(unsubscriptionBatches.flat()).toHaveLength(
		subscriptions.filter((result) => result.success).length,
	);
});
