import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {CodemodsInternals} from '@remotion/codemods';
import type {
	SubscribeToSequencePropsBatchRequest,
	UnsubscribeFromSequencePropsBatchRequest,
	UnsubscribeFromSequencePropsRequest,
} from '@remotion/studio-shared';
import {act, fireEvent, render, waitFor} from '@testing-library/react';
import {useContext, useState, type ContextType} from 'react';
import {
	Internals,
	Sequence,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
	type TSequence,
} from 'remotion';
import {ExpandedTracksProvider} from '../components/ExpandedTracksProvider';
import {SequencePropsSubscriptionProvider} from '../components/SequencePropsSubscriptionProvider';
import {shouldSubscribeToSequenceProps} from '../components/Timeline/should-subscribe-to-sequence-props';
import {SubscribeToNodePaths} from '../components/Timeline/SubscribeToNodePaths';
import {useResolveStackAndReactToChange} from '../components/Timeline/use-resolved-stack-react-to-change';
import {StudioServerConnectionCtx} from '../helpers/client-id';

const fileName = __filename;
const source = readFileSync(fileName, 'utf8').split('\ntest(')[0];
let generatedSourceUrl: string | null = null;

// Supply the source locations normally injected by the Studio bundler. The
// subscription parser reads the same JSX that React mounts below.
const sourceProps = (name: string) => {
	const attribute = source.indexOf('name="' + name + '"');
	const opening = source.lastIndexOf('<Sequence', attribute);
	const lineNumber = source.slice(0, opening).split('\n').length;
	return {
		[Internals.REMOTION_INTERNAL_STACK_PROP]: generatedSourceUrl
			? `Error\n    at Sequence (${generatedSourceUrl}:${lineNumber}:1)`
			: Internals.makeOriginalSourceStack({
					fileName,
					lineNumber,
					columnNumber: 0,
				}),
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
	const refreshedSourceUrl = `http://localhost/source-subscription-${crypto.randomUUID()}.js`;
	let resolveSourceMap: (() => void) | null = null;
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
		if (endpoint === `${refreshedSourceUrl}.map`) {
			return new Promise<Response>((resolve) => {
				resolveSourceMap = () =>
					resolve(
						Response.json({
							version: 3,
							sources: [fileName],
							sourcesContent: [subscriptionSource],
							names: [],
							// Map the first line two lines down, then advance one line
							// in the original source for every generated line.
							mappings: source
								.split('\n')
								.map((_, index) => (index === 0 ? 'AAEA' : 'AACA'))
								.join(';'),
						}),
					);
			});
		}

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

	// Exercise the same shared location hook and conditional source controls as
	// the inspector, without depending on browser layout to detect a remount.
	const SourceInspector = ({sequence}: {readonly sequence: TSequence}) => {
		const {resolvedLocation} = useResolveStackAndReactToChange(
			sequence.getStack,
			sequence.controls?.overrideId ?? sequence.id,
		);
		return resolvedLocation ? (
			<fieldset>
				<legend>Source controls</legend>
				<label>
					Inspector draft
					<input defaultValue="Parent" />
				</label>
				<output aria-label="Source line">{resolvedLocation.line}</output>
			</fieldset>
		) : null;
	};

	const Subscriptions = () => {
		const sequences = Internals.useSequenceManagerSequences();
		setters.current = useContext(Internals.VisualModeSettersContext);
		const inspectedSequence = sequences.find(
			(sequence) => sequence.displayName === 'Parent',
		);
		return (
			<>
				{sequences.map((sequence) =>
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
				)}
				{inspectedSequence ? (
					<SourceInspector sequence={inspectedSequence} />
				) : null}
			</>
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
		// event. While its source map is pending, keep source controls mounted but
		// do not subscribe with the previous source location.
		const inspectorDraft = rendered.getByRole('textbox', {
			name: 'Inspector draft',
		}) as HTMLInputElement;
		const originalLine = rendered.getByRole('status', {
			name: 'Source line',
		}).textContent;
		fireEvent.change(inspectorDraft, {target: {value: 'In-progress edit'}});
		inspectorDraft.focus();
		generatedSourceUrl = refreshedSourceUrl;
		subscriptionSource = `\n\n${source}`;
		await act(async () => {
			refreshFixture();
			await Promise.resolve();
		});
		await waitFor(() => expect(resolveSourceMap).not.toBeNull());
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(subscriptions).toHaveLength(4);
		expect(rendered.getByRole('textbox', {name: 'Inspector draft'})).toBe(
			inspectorDraft,
		);
		expect(inspectorDraft.value).toBe('In-progress edit');
		expect(document.activeElement).toBe(inspectorDraft);
		expect(
			rendered.getByRole('status', {name: 'Source line'}).textContent,
		).toBe(originalLine);

		await act(async () => {
			resolveSourceMap!();
			await Promise.resolve();
		});
		await waitFor(() =>
			expect(rendered!.getByTestId('A').textContent).toBe('180'),
		);
		expect(rendered.getByTestId('B').textContent).toBe('200');
		expect(
			rendered.getByRole('status', {name: 'Source line'}).textContent,
		).toBe(String(Number(originalLine) + 2));
		expect(rendered.getByRole('textbox', {name: 'Inspector draft'})).toBe(
			inspectorDraft,
		);
		expect(inspectorDraft.value).toBe('In-progress edit');
		expect(document.activeElement).toBe(inspectorDraft);
		expect(subscriptions).toHaveLength(8);

		// Returning to the cached compiler-provided stack must also resolve the
		// original location immediately, without briefly using the shifted line.
		generatedSourceUrl = null;
		subscriptionSource = source;
		await act(async () => {
			refreshFixture();
			await Promise.resolve();
		});
		await waitFor(() =>
			expect(
				rendered!.getByRole('status', {name: 'Source line'}).textContent,
			).toBe(originalLine),
		);
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(rendered.getByRole('textbox', {name: 'Inspector draft'})).toBe(
			inspectorDraft,
		);
		expect(inspectorDraft.value).toBe('In-progress edit');
		expect(document.activeElement).toBe(inspectorDraft);
	} finally {
		await act(async () => {
			rendered?.unmount();
			await Promise.resolve();
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		globalThis.fetch = previousFetch;
		generatedSourceUrl = null;
	}

	// Four subscriptions per source version, without transient subscriptions
	// using the previous stack's source location.
	expect(subscriptions).toHaveLength(12);
	expect(subscriptions.every((result) => result.success)).toBe(true);
	// Both refreshes and final unmount send one batch each, preserving every release.
	expect(unsubscriptionBatches).toHaveLength(3);
	expect(unsubscriptionBatches.at(-1)).toHaveLength(4);
	expect(unsubscriptionBatches.flat()).toHaveLength(
		subscriptions.filter((result) => result.success).length,
	);
});
