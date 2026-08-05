import {afterEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render, waitFor} from '@testing-library/react';
import React, {useCallback, useMemo, useState} from 'react';
import {AbsoluteFill} from '../AbsoluteFill.js';
import {
	AnimatedImage,
	animatedImageSchema,
} from '../animated-image/AnimatedImage.js';
import type {
	SequenceControls,
	SequenceRegistrationControls,
	TSequence,
} from '../CompositionManager.js';
import type {
	EffectDefinition,
	EffectDescriptor,
} from '../effects/effect-types.js';
import {Img, imgSchema} from '../Img.js';
import {Interactive} from '../Interactive.js';
import {Internals} from '../internals.js';
import {Loading} from '../loading-indicator.js';
import type {OverrideIdToNodePaths} from '../sequence-node-path.js';
import {OverrideIdsToNodePathsGettersContext} from '../sequence-node-path.js';
import {Sequence} from '../Sequence.js';
import type {
	SequenceManagerContext,
	SequencePropsSubscriptionKey,
} from '../SequenceManager.js';
import {
	SequenceManager,
	SequenceManagerProvider,
	SequenceManagerRefContext,
	VisualModeDragOverridesContext,
	VisualModePropStatusesContext,
	VisualModePropStatusesRefContext,
	VisualModeSettersContext,
} from '../SequenceManager.js';
import {Series} from '../series/index.js';
import {useCurrentFrame} from '../use-current-frame.js';
import type {BasicMediaInTimelineReturnType} from '../use-media-in-timeline.js';
import type {DragOverrides, PropStatuses} from '../use-schema.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(cleanup);

type SequenceTestWrapperProps = {
	readonly children: React.ReactNode;
	readonly onRegisterSequence: (sequence: TSequence) => void;
	readonly rerenderOnRegister?: boolean;
	readonly compositionDurationInFrames?: number;
	readonly currentFrame?: number;
	readonly readOnlyStudio?: boolean;
};

type VisualModeOverrides = {
	readonly overrideIdToNodePathMappings: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
	readonly dragOverrides: DragOverrides;
};

const makeEffect = (): EffectDescriptor<unknown> => {
	const definition: EffectDefinition<unknown> = {
		type: 'test-effect',
		label: 'Test effect',
		documentationLink: null,
		backend: '2d',
		calculateKey: () => 'test-effect',
		setup: () => ({}),
		apply: () => undefined,
		cleanup: () => undefined,
		schema: {},
		validateParams: () => undefined,
	};

	return {
		definition,
		effectKey: 'test-effect',
		params: {},
		memoized: false,
	};
};

const SequenceTestWrapperWithVisualModeOverrides: React.FC<
	SequenceTestWrapperProps & {
		readonly visualModeOverrides: VisualModeOverrides | null;
	}
> = ({
	children,
	onRegisterSequence,
	rerenderOnRegister = false,
	visualModeOverrides,
	compositionDurationInFrames,
	currentFrame,
	readOnlyStudio = false,
}) => {
	const [, setTick] = useState(0);

	const registerSequence = useCallback(
		(sequence: TSequence) => {
			onRegisterSequence(sequence);
			if (rerenderOnRegister) {
				setTick((t) => t + 1);
			}
		},
		[onRegisterSequence, rerenderOnRegister],
	);

	const unregisterSequence = useCallback(() => undefined, []);

	const ctx: SequenceManagerContext = useMemo(
		() => ({registerSequence, unregisterSequence, sequences: []}),
		[registerSequence, unregisterSequence],
	);

	const visualPropStatuses = useMemo(
		() => ({
			propStatuses: visualModeOverrides?.propStatuses ?? {},
		}),
		[visualModeOverrides],
	);

	const visualDragOverrides = useMemo(
		() => ({
			getDragOverrides: (nodePath: SequencePropsSubscriptionKey) =>
				visualModeOverrides?.dragOverrides[
					Internals.makeSequencePropsSubscriptionKey(nodePath)
				] ?? {},
			getEffectDragOverrides: () => ({}),
		}),
		[visualModeOverrides],
	);

	const overrideIdToNodePathContext = useMemo(
		() => ({
			overrideIdToNodePathMappings:
				visualModeOverrides?.overrideIdToNodePathMappings ?? {},
		}),
		[visualModeOverrides],
	);

	const visualSetters = useMemo(
		() => ({
			setDragOverrides: () => undefined,
			clearDragOverrides: () => undefined,
			setEffectDragOverrides: () => undefined,
			clearEffectDragOverrides: () => undefined,
			setPropStatuses: () => undefined,
		}),
		[],
	);

	return (
		<WrapSequenceContext
			compositionDurationInFrames={compositionDurationInFrames}
			currentFrame={currentFrame}
		>
			<Internals.RemotionEnvironmentContext
				value={{
					isRendering: false,
					isClientSideRendering: false,
					isPlayer: false,
					isStudio: true,
					isReadOnlyStudio: readOnlyStudio,
				}}
			>
				<OverrideIdsToNodePathsGettersContext.Provider
					value={overrideIdToNodePathContext}
				>
					<SequenceManager.Provider value={ctx}>
						<VisualModePropStatusesContext.Provider value={visualPropStatuses}>
							<VisualModeDragOverridesContext.Provider
								value={visualDragOverrides}
							>
								<VisualModeSettersContext.Provider value={visualSetters}>
									{children}
								</VisualModeSettersContext.Provider>
							</VisualModeDragOverridesContext.Provider>
						</VisualModePropStatusesContext.Provider>
					</SequenceManager.Provider>
				</OverrideIdsToNodePathsGettersContext.Provider>
			</Internals.RemotionEnvironmentContext>
		</WrapSequenceContext>
	);
};

const SequenceTestWrapper: React.FC<SequenceTestWrapperProps> = ({
	children,
	onRegisterSequence,
	rerenderOnRegister = false,
	compositionDurationInFrames,
	currentFrame,
	readOnlyStudio,
}) => {
	return (
		<SequenceTestWrapperWithVisualModeOverrides
			onRegisterSequence={onRegisterSequence}
			rerenderOnRegister={rerenderOnRegister}
			visualModeOverrides={null}
			compositionDurationInFrames={compositionDurationInFrames}
			currentFrame={currentFrame}
			readOnlyStudio={readOnlyStudio}
		>
			{children}
		</SequenceTestWrapperWithVisualModeOverrides>
	);
};

const makeMediaInTimelineData = ({
	startMediaFrom,
	playbackRate = 1,
}: {
	startMediaFrom: number;
	playbackRate?: number;
}): BasicMediaInTimelineReturnType =>
	({
		volumes: 1,
		duration: 100,
		doesVolumeChange: false,
		nonce: {get: () => [[0, 0]]},
		finalDisplayName: 'video.mp4',
		startMediaFrom,
		src: 'video.mp4',
		playbackRate,
	}) as unknown as BasicMediaInTimelineReturnType;

test('Sequence calls registerSequence exactly once on mount', () => {
	let registerCalls = 0;

	render(
		<SequenceTestWrapper
			rerenderOnRegister
			onRegisterSequence={() => {
				registerCalls++;
			}}
		>
			<Sequence>hi</Sequence>
		</SequenceTestWrapper>,
	);

	expect(registerCalls).toBe(1);
});

test('Interactive runtime values update mounted consumers without re-registering the sequence', () => {
	const registeredSequences: TSequence[] = [];
	const onRegisterSequence = (sequence: TSequence) => {
		registeredSequences.push(sequence);
	};

	const renderInteractiveDiv = (opacity: number, color: string) => (
		<SequenceTestWrapper onRegisterSequence={onRegisterSequence}>
			<Interactive.Div style={{color, opacity}}>Hello</Interactive.Div>
		</SequenceTestWrapper>
	);
	const producer = render(renderInteractiveDiv(0.25, 'red'));
	const controls = registeredSequences.find(
		(sequence) => sequence.displayName === '<Interactive.Div>',
	)?.controls;
	if (!controls) {
		throw new Error('Expected Interactive.Div controls');
	}

	let consumerRenders = 0;
	const RuntimeOpacity: React.FC<{
		readonly controls: SequenceRegistrationControls;
	}> = ({controls: consumerControls}) => {
		consumerRenders++;
		const opacity = React.useSyncExternalStore(
			consumerControls.runtimeValues.subscribe,
			() => consumerControls.runtimeValues.getSnapshot()['style.opacity'],
		);

		return <output>{String(opacity)}</output>;
	};

	const consumer = render(<RuntimeOpacity controls={controls} />);

	expect(consumer.getByText('0.25')).toBeTruthy();
	expect(consumerRenders).toBe(1);
	expect(registeredSequences).toHaveLength(1);

	producer.rerender(renderInteractiveDiv(0.75, 'red'));
	expect(consumer.getByText('0.75')).toBeTruthy();
	expect(consumerRenders).toBe(2);
	expect(registeredSequences).toHaveLength(1);

	producer.rerender(renderInteractiveDiv(0.75, 'blue'));
	expect(consumer.getByText('0.75')).toBeTruthy();
	expect(consumerRenders).toBe(2);
	expect(registeredSequences).toHaveLength(1);
});

test('Interactive runtime values are published only after a render commits', () => {
	const registeredSequences: TSequence[] = [];
	const onRegisterSequence = (sequence: TSequence) => {
		registeredSequences.push(sequence);
	};

	const never = new Promise<never>(() => undefined);
	const Suspend: React.FC<{readonly active: boolean}> = ({active}) => {
		if (active) {
			throw never;
		}

		return null;
	};

	const renderInteractiveDiv = (opacity: number, suspend: boolean) => (
		<React.Suspense fallback={<span>Suspended</span>}>
			<SequenceTestWrapper onRegisterSequence={onRegisterSequence}>
				<Interactive.Div style={{opacity}}>
					<Suspend active={suspend} />
				</Interactive.Div>
			</SequenceTestWrapper>
		</React.Suspense>
	);
	const producer = render(renderInteractiveDiv(0.25, false));
	const controls = registeredSequences.find(
		(sequence) => sequence.displayName === '<Interactive.Div>',
	)?.controls;
	if (!controls) {
		throw new Error('Expected Interactive.Div controls');
	}

	producer.rerender(renderInteractiveDiv(0.75, true));

	expect(producer.getByText('Suspended')).toBeTruthy();
	expect(controls.runtimeValues.getSnapshot()['style.opacity']).toBe(0.25);
});

test('Sequence registers its documentation link', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Sequence _remotionInternalDocumentationLink="https://www.remotion.dev/docs/img">
				hi
			</Sequence>
		</SequenceTestWrapper>,
	);

	expect(registeredSequences[0]?.documentationLink).toBe(
		'https://www.remotion.dev/docs/img',
	);
});

test('Sequence registers its wrapper element for Studio outlines', () => {
	const registeredSequences: TSequence[] = [];
	const ref = React.createRef<HTMLDivElement>();

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Sequence ref={ref}>hi</Sequence>
		</SequenceTestWrapper>,
	);

	expect(registeredSequences[0]?.refForOutline?.current?.tagName).toBe('DIV');
	expect(registeredSequences[0]?.refForOutline?.current).toBe(ref.current);
});

test('Sequence uses outlineRef for Studio outlines', () => {
	const registeredSequences: TSequence[] = [];
	const outlineRef = React.createRef<HTMLDivElement>();

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Sequence outlineRef={outlineRef}>
				<div ref={outlineRef}>hi</div>
			</Sequence>
		</SequenceTestWrapper>,
	);

	expect(registeredSequences[0]?.refForOutline).toBe(outlineRef);
	expect(registeredSequences[0]?.refForOutline?.current?.tagName).toBe('DIV');
});

test('Sequence layout="none" uses outlineRef for Studio outlines', () => {
	const registeredSequences: TSequence[] = [];
	const outlineRef = React.createRef<HTMLDivElement>();

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Sequence layout="none" outlineRef={outlineRef}>
				<div ref={outlineRef}>hi</div>
			</Sequence>
		</SequenceTestWrapper>,
	);

	expect(registeredSequences[0]?.refForOutline).toBe(outlineRef);
	expect(registeredSequences[0]?.refForOutline?.current?.tagName).toBe('DIV');
});

test('Series inherits Sequence controls', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Series from={5} freeze={2}>
				<Series.Sequence durationInFrames={10}>First</Series.Sequence>
			</Series>
		</SequenceTestWrapper>,
	);

	const series = registeredSequences.find(
		(sequence) =>
			sequence.controls?.componentIdentity === 'dev.remotion.remotion.Series',
	);

	expect(series?.controls?.schema).toHaveProperty('from');
	expect(series?.controls?.schema).toHaveProperty('freeze');
	expect(series?.controls?.schema).toHaveProperty('durationInFrames');
	expect(series?.isInsideSeries).toBe(false);
});

test('Series.Sequence registers with its own visual controls', () => {
	const registeredSequences: TSequence[] = [];
	const firstStack = 'Error\n    at FirstSeriesSequence';
	const secondStack = 'Error\n    at SecondSeriesSequence';

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Series>
				<Series.Sequence
					durationInFrames={10}
					premountFor={30}
					{...({
						_remotionInternalStack: firstStack,
					} as {readonly _remotionInternalStack: string})}
				>
					First
				</Series.Sequence>
				<Series.Sequence
					durationInFrames={20}
					{...({
						_remotionInternalStack: secondStack,
					} as {readonly _remotionInternalStack: string})}
				>
					Second
				</Series.Sequence>
			</Series>
		</SequenceTestWrapper>,
	);

	const seriesSequences = registeredSequences.filter(
		(sequence) => sequence.displayName === '<Series.Sequence>',
	);

	expect(seriesSequences).toHaveLength(2);
	for (const sequence of seriesSequences) {
		expect(sequence.controls?.componentIdentity).toBe(
			'dev.remotion.remotion.Series.Sequence',
		);
		expect(sequence.isInsideSeries).toBe(true);
	}

	expect(
		seriesSequences.map(
			(sequence) =>
				sequence.controls?.runtimeValues.getSnapshot().durationInFrames,
		),
	).toEqual([10, 20]);
	expect(seriesSequences.map((sequence) => sequence.getStack())).toEqual([
		firstStack,
		secondStack,
	]);
});

test('Interactive.withSchema preserves source stacks through controls without consuming a public stack prop', () => {
	const registeredSequences: TSequence[] = [];
	const sourceStack = 'Error\n    at UserAuthoredComponent';
	const received = {
		stack: null as string | null,
		internalStack: false,
	};

	type PublicProps = {readonly stack: string};
	const Inner: React.FC<
		PublicProps & {readonly controls: SequenceControls | undefined}
	> = (props) => {
		received.stack = props.stack;
		received.internalStack = '_remotionInternalStack' in props;
		return <Sequence controls={props.controls} name="<Component>" />;
	};

	const Component = Interactive.withSchema({
		Component: Inner,
		componentName: '<Component>',
		componentIdentity: 'com.example.Component',
		schema: {},
		supportsEffects: false,
	});

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Component
				stack="application-stack"
				{...({
					_remotionInternalStack: sourceStack,
				} as {readonly _remotionInternalStack: string})}
			/>
		</SequenceTestWrapper>,
	);

	expect(received.stack).toBe('application-stack');
	expect(received.internalStack).toBe(false);
	expect(registeredSequences).toHaveLength(1);
	expect(registeredSequences[0]?.getStack()).toBe(sourceStack);
	expect(registeredSequences[0]?.controls?.componentIdentity).toBe(
		'com.example.Component',
	);
});

test('read-only Studio registers visual controls without applying overrides', () => {
	const registeredSequences: TSequence[] = [];
	const nodePath = {
		absolutePath: '/src/Composition.tsx',
		nodePath: ['body', 0],
		sequenceKeys: [],
		effectKeys: [],
		videoConfigValues: null,
	};
	const subscriptionKey = Internals.makeSequencePropsSubscriptionKey(nodePath);

	render(
		<SequenceTestWrapperWithVisualModeOverrides
			readOnlyStudio
			onRegisterSequence={(registeredSequence) => {
				registeredSequences.push(registeredSequence);
			}}
			visualModeOverrides={{
				overrideIdToNodePathMappings: new Proxy(
					{},
					{get: () => nodePath},
				) as OverrideIdToNodePaths,
				propStatuses: {},
				dragOverrides: {
					[subscriptionKey]: {
						durationInFrames: Internals.makeStaticDragOverride(20),
					},
				},
			}}
		>
			<Interactive.Div durationInFrames={10}>Hello</Interactive.Div>
		</SequenceTestWrapperWithVisualModeOverrides>,
	);

	const sequence = registeredSequences.find(
		(item) => item.displayName === '<Interactive.Div>',
	);
	expect(sequence?.controls).not.toBe(null);
	expect(sequence?.controls?.componentIdentity).toBe(
		'dev.remotion.remotion.Interactive.Div',
	);
	expect(sequence?.duration).toBe(10);
});

test('Series.Sequence timing overrides cascade to later sequences', async () => {
	const registeredSequences: TSequence[] = [];
	const onRegisterSequence = (sequence: TSequence) => {
		registeredSequences.push(sequence);
	};

	const renderSeries = ({
		overrideIdToNodePathMappings,
		propStatuses,
		dragOverrides,
	}: {
		overrideIdToNodePathMappings: OverrideIdToNodePaths;
		propStatuses: PropStatuses;
		dragOverrides: DragOverrides;
	}) => (
		<SequenceTestWrapperWithVisualModeOverrides
			onRegisterSequence={onRegisterSequence}
			visualModeOverrides={{
				overrideIdToNodePathMappings,
				propStatuses,
				dragOverrides,
			}}
		>
			<Series>
				<Series.Sequence name="First" durationInFrames={10} trimBefore={2}>
					First
				</Series.Sequence>
				<Series.Sequence name="Second" durationInFrames={20}>
					Second
				</Series.Sequence>
			</Series>
		</SequenceTestWrapperWithVisualModeOverrides>
	);

	const rendered = render(
		renderSeries({
			overrideIdToNodePathMappings: {},
			propStatuses: {},
			dragOverrides: {},
		}),
	);
	const firstSequence = registeredSequences.find(
		(sequence) => sequence.displayName === 'First',
	);
	if (!firstSequence?.controls) {
		throw new Error('Expected the first Series.Sequence to be interactive');
	}

	const firstSequenceControls = firstSequence.controls;

	const nodePath = {
		absolutePath: '/src/Composition.tsx',
		nodePath: ['body', 0],
		sequenceKeys: [],
		effectKeys: [],
		videoConfigValues: null,
	};
	const subscriptionKey = Internals.makeSequencePropsSubscriptionKey(nodePath);
	const makeTimingOverride = ({
		durationInFrames,
		trimBefore,
	}: {
		durationInFrames: number;
		trimBefore: number;
	}) => ({
		overrideIdToNodePathMappings: {
			[firstSequenceControls.overrideId]: nodePath,
		},
		propStatuses: {
			[subscriptionKey]: {
				canUpdate: true as const,
				props: {
					durationInFrames: {status: 'static' as const, codeValue: 10},
					trimBefore: {status: 'static' as const, codeValue: 2},
				},
				effects: [],
			},
		},
		dragOverrides: {
			[subscriptionKey]: {
				durationInFrames: Internals.makeStaticDragOverride(durationInFrames),
				trimBefore: Internals.makeStaticDragOverride(trimBefore),
			},
		},
	});

	registeredSequences.length = 0;
	rendered.rerender(
		renderSeries(makeTimingOverride({durationInFrames: 7, trimBefore: 5})),
	);
	await waitFor(() => {
		const first = registeredSequences.find(
			(sequence) => sequence.displayName === 'First',
		);
		expect(first?.duration).toBe(7);
		expect(first?.trimBefore).toBe(5);
		expect(
			registeredSequences.find((sequence) => sequence.displayName === 'Second')
				?.from,
		).toBe(7);
	});

	registeredSequences.length = 0;
	rendered.rerender(
		renderSeries(makeTimingOverride({durationInFrames: 18, trimBefore: 7})),
	);
	await waitFor(() => {
		const first = registeredSequences.find(
			(sequence) => sequence.displayName === 'First',
		);
		expect(first?.duration).toBe(18);
		expect(first?.trimBefore).toBe(7);
		expect(
			registeredSequences.find((sequence) => sequence.displayName === 'Second')
				?.from,
		).toBe(18);
	});
});

test('Img registers its documentation link for default labels', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Img src="test.png" />
		</SequenceTestWrapper>,
	);

	expect(registeredSequences[0]?.documentationLink).toBe(
		'https://www.remotion.dev/docs/img',
	);
});

test('Named Img components keep the default documentation link', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Img src="test.png" name="Intro" />
		</SequenceTestWrapper>,
	);

	expect(registeredSequences[0]?.documentationLink).toBe(
		'https://www.remotion.dev/docs/img',
	);
});

test('Img exposes non-keyframable premounting schema fields', () => {
	expect(imgSchema.premountFor.keyframable).toBe(false);
	expect(imgSchema.postmountFor.keyframable).toBe(false);
});

test('Img hides the image while premounted and postmounted', () => {
	const premounted = render(
		<SequenceTestWrapper currentFrame={0} onRegisterSequence={() => undefined}>
			<Img
				src="test.png"
				from={10}
				durationInFrames={20}
				premountFor={10}
				style={{opacity: 0.5}}
			/>
		</SequenceTestWrapper>,
	);
	const premountedStyle = premounted.container
		.querySelector('img')
		?.getAttribute('style');
	expect(premountedStyle).toContain('display: none');
	expect(premountedStyle).toContain('pointer-events: none');
	expect(premountedStyle).toContain('opacity: 0.5');
	premounted.unmount();

	const postmounted = render(
		<SequenceTestWrapper currentFrame={35} onRegisterSequence={() => undefined}>
			<Img src="test.png" from={10} durationInFrames={20} postmountFor={10} />
		</SequenceTestWrapper>,
	);
	const postmountedStyle = postmounted.container
		.querySelector('img')
		?.getAttribute('style');
	expect(postmountedStyle).toContain('display: none');
	expect(postmountedStyle).toContain('pointer-events: none');
});

test('Img allows overriding the premount and postmount styles', () => {
	const premounted = render(
		<SequenceTestWrapper currentFrame={0} onRegisterSequence={() => undefined}>
			<Img
				src="test.png"
				from={10}
				durationInFrames={20}
				premountFor={10}
				styleWhilePremounted={{display: 'block', opacity: 0.25}}
			/>
		</SequenceTestWrapper>,
	);
	const premountedStyle = premounted.container
		.querySelector('img')
		?.getAttribute('style');
	expect(premountedStyle).toContain('display: block');
	expect(premountedStyle).toContain('opacity: 0.25');
	premounted.unmount();

	const postmounted = render(
		<SequenceTestWrapper currentFrame={35} onRegisterSequence={() => undefined}>
			<Img
				src="test.png"
				from={10}
				durationInFrames={20}
				postmountFor={10}
				styleWhilePostmounted={{display: 'block', opacity: 0.75}}
			/>
		</SequenceTestWrapper>,
	);
	const postmountedStyle = postmounted.container
		.querySelector('img')
		?.getAttribute('style');
	expect(postmountedStyle).toContain('display: block');
	expect(postmountedStyle).toContain('opacity: 0.75');
});

test('Img registers premount and postmount ranges once', async () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Img
				src="test.png"
				from={10}
				durationInFrames={20}
				premountFor={10}
				postmountFor={5}
			/>
		</SequenceTestWrapper>,
	);

	await waitFor(() => {
		expect(registeredSequences).toHaveLength(1);
	});
	expect(registeredSequences[0].premountDisplay).toBe(10);
	expect(registeredSequences[0].postmountDisplay).toBe(5);
});

test('Img with effects delegates premounting to one CanvasImage owner', async () => {
	const registeredSequences: TSequence[] = [];

	const rendered = render(
		<SequenceTestWrapper
			currentFrame={0}
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Img
				src="test.png"
				width={100}
				height={50}
				effects={[makeEffect()]}
				from={10}
				durationInFrames={20}
				premountFor={10}
				postmountFor={5}
			/>
		</SequenceTestWrapper>,
	);

	await waitFor(() => {
		expect(registeredSequences).toHaveLength(1);
	});
	expect(registeredSequences[0].premountDisplay).toBe(10);
	expect(registeredSequences[0].postmountDisplay).toBe(5);
	expect(registeredSequences[0].documentationLink).toBe(
		'https://www.remotion.dev/docs/img',
	);
	expect(
		rendered.container.querySelector('canvas')?.getAttribute('style'),
	).toContain('display: none');
});

test('AnimatedImage registers its canvas ref for the Studio outline', () => {
	const registeredSequences: TSequence[] = [];
	const ref = React.createRef<HTMLCanvasElement>();

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<AnimatedImage ref={ref} onError={() => undefined} src="test.gif" />
		</SequenceTestWrapper>,
	);

	const refForOutline = registeredSequences[0]
		?.refForOutline as React.RefObject<HTMLCanvasElement | null>;

	expect(refForOutline.current).toBeInstanceOf(HTMLCanvasElement);
	expect(ref.current).toBe(refForOutline.current);
});

test('AnimatedImage exposes non-keyframable premounting schema fields', () => {
	expect(animatedImageSchema.premountFor.keyframable).toBe(false);
	expect(animatedImageSchema.postmountFor.keyframable).toBe(false);
});

test('AnimatedImage applies crop props to its canvas', () => {
	const {container} = render(
		<SequenceTestWrapper onRegisterSequence={() => undefined}>
			<AnimatedImage
				cropBottom={0.4}
				cropLeft={0.1}
				cropRight={0.2}
				cropTop={0.3}
				onError={() => undefined}
				src="test.gif"
			/>
		</SequenceTestWrapper>,
	);

	const canvas = container.querySelector('canvas');
	expect(canvas?.style.clipPath).toBe('inset(30% 20% 40% 10%)');
});

test('AnimatedImage hides the canvas while premounted and postmounted', () => {
	const premounted = render(
		<SequenceTestWrapper currentFrame={0} onRegisterSequence={() => undefined}>
			<AnimatedImage
				src="test.gif"
				from={10}
				durationInFrames={20}
				premountFor={10}
				style={{opacity: 0.5}}
				onError={() => undefined}
			/>
		</SequenceTestWrapper>,
	);
	const premountedStyle = premounted.container
		.querySelector('canvas')
		?.getAttribute('style');
	expect(premountedStyle).toContain('display: none');
	expect(premountedStyle).toContain('pointer-events: none');
	expect(premountedStyle).toContain('opacity: 0.5');
	premounted.unmount();

	const postmounted = render(
		<SequenceTestWrapper currentFrame={35} onRegisterSequence={() => undefined}>
			<AnimatedImage
				src="test.gif"
				from={10}
				durationInFrames={20}
				postmountFor={10}
				onError={() => undefined}
			/>
		</SequenceTestWrapper>,
	);
	const postmountedStyle = postmounted.container
		.querySelector('canvas')
		?.getAttribute('style');
	expect(postmountedStyle).toContain('display: none');
	expect(postmountedStyle).toContain('pointer-events: none');
});

test('AnimatedImage allows overriding the premount and postmount styles', () => {
	const premounted = render(
		<SequenceTestWrapper currentFrame={0} onRegisterSequence={() => undefined}>
			<AnimatedImage
				src="test.gif"
				from={10}
				durationInFrames={20}
				premountFor={10}
				styleWhilePremounted={{display: 'block', opacity: 0.25}}
				onError={() => undefined}
			/>
		</SequenceTestWrapper>,
	);
	const premountedStyle = premounted.container
		.querySelector('canvas')
		?.getAttribute('style');
	expect(premountedStyle).toContain('display: block');
	expect(premountedStyle).toContain('opacity: 0.25');
	premounted.unmount();

	const postmounted = render(
		<SequenceTestWrapper currentFrame={35} onRegisterSequence={() => undefined}>
			<AnimatedImage
				src="test.gif"
				from={10}
				durationInFrames={20}
				postmountFor={10}
				styleWhilePostmounted={{display: 'block', opacity: 0.75}}
				onError={() => undefined}
			/>
		</SequenceTestWrapper>,
	);
	const postmountedStyle = postmounted.container
		.querySelector('canvas')
		?.getAttribute('style');
	expect(postmountedStyle).toContain('display: block');
	expect(postmountedStyle).toContain('opacity: 0.75');
});

test('AnimatedImage registers premount and postmount ranges once', async () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<AnimatedImage
				src="test.gif"
				from={10}
				durationInFrames={20}
				premountFor={10}
				postmountFor={5}
				onError={() => undefined}
			/>
		</SequenceTestWrapper>,
	);

	await waitFor(() => {
		expect(registeredSequences).toHaveLength(1);
	});
	expect(registeredSequences[0].premountDisplay).toBe(10);
	expect(registeredSequences[0].postmountDisplay).toBe(5);
});

test('AnimatedImage remains visible with a negative offset', () => {
	const {container} = render(
		<SequenceTestWrapper
			compositionDurationInFrames={100}
			currentFrame={75}
			onRegisterSequence={() => undefined}
		>
			<AnimatedImage from={-100} onError={() => undefined} src="test.gif" />
		</SequenceTestWrapper>,
	);

	expect(container.querySelector('canvas')).not.toBeNull();
});

test('AnimatedImage forwards data and aria attributes to its canvas', () => {
	const {container} = render(
		<SequenceTestWrapper onRegisterSequence={() => undefined}>
			<AnimatedImage
				aria-label="Animated image preview"
				data-testid="animated-image-canvas"
				onError={() => undefined}
				src="test.gif"
			/>
		</SequenceTestWrapper>,
	);

	const canvas = container.querySelector('canvas');

	expect(canvas?.getAttribute('aria-label')).toBe('Animated image preview');
	expect(canvas?.getAttribute('data-testid')).toBe('animated-image-canvas');
});

test('Video media registration accounts for its own negative from', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Sequence
				layout="none"
				from={-10}
				durationInFrames={50}
				_remotionInternalIsMedia={{
					type: 'video',
					data: makeMediaInTimelineData({startMediaFrom: 5}),
				}}
			/>
		</SequenceTestWrapper>,
	);

	const videoSequence = registeredSequences.find(
		(sequence) => sequence.type === 'video',
	);

	expect(videoSequence?.startMediaFrom).toBe(15);
	expect(videoSequence?.mediaFrameAtSequenceZero).toBe(5);
});

test('Video media registration keeps trimBefore at sequence frame zero', () => {
	const registeredSequences: TSequence[] = [];
	const onRegisterSequence = (sequence: TSequence) => {
		registeredSequences.push(sequence);
	};

	const {rerender} = render(
		<SequenceTestWrapper onRegisterSequence={onRegisterSequence}>
			<Sequence
				layout="none"
				from={31}
				durationInFrames={47}
				_remotionInternalIsMedia={{
					type: 'video',
					data: makeMediaInTimelineData({startMediaFrom: 31}),
				}}
			/>
		</SequenceTestWrapper>,
	);

	const videoSequence = registeredSequences.find(
		(sequence) => sequence.type === 'video',
	);

	expect(videoSequence?.from).toBe(31);
	expect(videoSequence?.duration).toBe(47);
	expect(videoSequence?.mediaFrameAtSequenceZero).toBe(31);

	rerender(
		<SequenceTestWrapper onRegisterSequence={onRegisterSequence}>
			<Sequence
				layout="none"
				from={31}
				durationInFrames={47}
				_remotionInternalIsMedia={{
					type: 'video',
					data: makeMediaInTimelineData({startMediaFrom: 41}),
				}}
			/>
		</SequenceTestWrapper>,
	);

	const updatedVideoSequence = registeredSequences.at(-1);
	if (updatedVideoSequence?.type !== 'video') {
		throw new Error('Expected an updated video sequence');
	}

	expect(updatedVideoSequence.mediaFrameAtSequenceZero).toBe(41);
});

test('Video media registration accounts for Sequence trimBefore', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Sequence
				layout="none"
				trimBefore={10}
				durationInFrames={50}
				_remotionInternalIsMedia={{
					type: 'video',
					data: makeMediaInTimelineData({startMediaFrom: 5}),
				}}
			/>
		</SequenceTestWrapper>,
	);

	const videoSequence = registeredSequences.find(
		(sequence) => sequence.type === 'video',
	);

	expect(videoSequence?.startMediaFrom).toBe(15);
	expect(videoSequence?.mediaFrameAtSequenceZero).toBe(5);
});

test('Video media registration stores frozen media frame', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Sequence
				layout="none"
				durationInFrames={50}
				freeze={12}
				_remotionInternalIsMedia={{
					type: 'video',
					data: makeMediaInTimelineData({
						startMediaFrom: 5,
						playbackRate: 2,
					}),
				}}
			/>
		</SequenceTestWrapper>,
	);

	const videoSequence = registeredSequences.find(
		(sequence) => sequence.type === 'video',
	);

	expect(videoSequence?.frozenFrame).toBe(12);
	expect(videoSequence?.mediaFrameAtSequenceZero).toBe(5);
	expect(videoSequence?.frozenMediaFrame).toBe(29);
});

test('Video media registration keeps frozen frame sequence-local for negative from', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Sequence
				layout="none"
				from={-10}
				durationInFrames={50}
				freeze={12}
				_remotionInternalIsMedia={{
					type: 'video',
					data: makeMediaInTimelineData({startMediaFrom: 5}),
				}}
			/>
		</SequenceTestWrapper>,
	);

	const videoSequence = registeredSequences.find(
		(sequence) => sequence.type === 'video',
	);

	expect(videoSequence?.startMediaFrom).toBe(15);
	expect(videoSequence?.mediaFrameAtSequenceZero).toBe(5);
	expect(videoSequence?.frozenFrame).toBe(12);
	expect(videoSequence?.frozenMediaFrame).toBe(17);
});

test('Img registers a refForOutline pointing to the rendered image element', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Img src="test.png" />
		</SequenceTestWrapper>,
	);

	expect(registeredSequences[0]?.refForOutline?.current?.tagName).toBe('IMG');
});

test('Interactive elements register their rendered element for Studio outlines', () => {
	const registeredSequences: TSequence[] = [];
	const divRef = React.createRef<HTMLDivElement>();
	const rectRef = React.createRef<SVGRectElement>();
	const documentationLink = 'https://www.remotion.dev/docs/interactive';

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Interactive.Div
				ref={divRef}
				cropBottom={0.4}
				cropLeft={0.1}
				cropRight={0.2}
				cropTop={0.3}
			>
				Hello
			</Interactive.Div>
			<Interactive.Span>World</Interactive.Span>
			<Interactive.Svg viewBox="0 0 100 100">
				<Interactive.Circle />
				<Interactive.Ellipse />
				<Interactive.G />
				<Interactive.Line />
				<Interactive.Path />
				<Interactive.Rect
					ref={rectRef}
					cropLeft={0.25}
					height={100}
					width={100}
				/>
				<Interactive.Text x={50} y={50}>
					Label
				</Interactive.Text>
			</Interactive.Svg>
		</SequenceTestWrapper>,
	);

	expect(
		registeredSequences.map((sequence) => sequence.displayName).sort(),
	).toEqual([
		'<Interactive.Circle>',
		'<Interactive.Div>',
		'<Interactive.Ellipse>',
		'<Interactive.G>',
		'<Interactive.Line>',
		'<Interactive.Path>',
		'<Interactive.Rect>',
		'<Interactive.Span>',
		'<Interactive.Svg>',
		'<Interactive.Text>',
	]);

	const getByName = (displayName: string) =>
		registeredSequences.find(
			(sequence) => sequence.displayName === displayName,
		);

	expect(getByName('<Interactive.Div>')?.refForOutline?.current?.tagName).toBe(
		'DIV',
	);
	expect(getByName('<Interactive.Span>')?.refForOutline?.current?.tagName).toBe(
		'SPAN',
	);
	expect(getByName('<Interactive.Svg>')?.refForOutline?.current?.tagName).toBe(
		'svg',
	);
	expect(getByName('<Interactive.Rect>')?.refForOutline?.current?.tagName).toBe(
		'rect',
	);
	expect(getByName('<Interactive.Text>')?.refForOutline?.current?.tagName).toBe(
		'text',
	);
	expect(getByName('<Interactive.Div>')?.documentationLink).toBe(
		documentationLink,
	);
	expect(getByName('<Interactive.Rect>')?.documentationLink).toBe(
		documentationLink,
	);
	expect(getByName('<Interactive.Div>')?.refForOutline?.current).toBe(
		divRef.current,
	);
	expect(getByName('<Interactive.Div>')?.controls).not.toBe(null);
	expect(divRef.current?.style.clipPath).toBe('inset(30% 20% 40% 10%)');
	expect(divRef.current?.getAttributeNames()).not.toContain('cropleft');
	expect(rectRef.current?.style.clipPath).toBe('inset(0% 0% 0% 25%)');

	for (const sequence of registeredSequences) {
		for (const cropField of [
			'cropLeft',
			'cropRight',
			'cropTop',
			'cropBottom',
		]) {
			expect(sequence.controls?.schema).toHaveProperty(cropField);
		}
	}

	for (const displayName of [
		'<Interactive.Div>',
		'<Interactive.Span>',
		'<Interactive.Text>',
	]) {
		expect(getByName(displayName)?.controls?.schema).toHaveProperty([
			'style.fontSize',
		]);
		expect(getByName(displayName)?.controls?.schema).toHaveProperty('children');
	}

	for (const displayName of [
		'<Interactive.Circle>',
		'<Interactive.Ellipse>',
		'<Interactive.G>',
		'<Interactive.Line>',
		'<Interactive.Path>',
		'<Interactive.Rect>',
		'<Interactive.Svg>',
	]) {
		expect(getByName(displayName)?.controls?.schema).not.toHaveProperty([
			'style.fontSize',
		]);
		expect(getByName(displayName)?.controls?.schema).not.toHaveProperty(
			'children',
		);
		expect(getByName(displayName)?.controls?.schema).toHaveProperty('stroke');
		expect(getByName(displayName)?.controls?.schema).toHaveProperty(
			'strokeWidth',
		);
	}

	for (const displayName of [
		'<Interactive.Circle>',
		'<Interactive.Ellipse>',
		'<Interactive.G>',
		'<Interactive.Path>',
		'<Interactive.Rect>',
		'<Interactive.Svg>',
		'<Interactive.Text>',
	]) {
		expect(getByName(displayName)?.controls?.schema).toHaveProperty('fill');
	}

	expect(getByName('<Interactive.Line>')?.controls?.schema).not.toHaveProperty(
		'fill',
	);
});

test('AbsoluteFill is an interactive sequence while preserving its div contract', () => {
	const registeredSequences: TSequence[] = [];
	const divRef = React.createRef<HTMLDivElement>();
	let clickCount = 0;

	const {container} = render(
		<SequenceTestWrapper
			currentFrame={4}
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<AbsoluteFill
				ref={divRef}
				id="interactive-fill"
				from={4}
				durationInFrames={12}
				style={{backgroundColor: 'red'}}
				onClick={() => {
					clickCount++;
				}}
			>
				Hello
			</AbsoluteFill>
		</SequenceTestWrapper>,
	);

	const element = container.querySelector<HTMLDivElement>('#interactive-fill');
	if (!element) {
		throw new Error('Expected AbsoluteFill to render its div');
	}

	fireEvent.click(element);

	expect(container.querySelectorAll('#interactive-fill')).toHaveLength(1);
	expect(divRef.current).toBe(element);
	expect(clickCount).toBe(1);
	expect(registeredSequences).toHaveLength(1);
	expect(registeredSequences[0]).toMatchObject({
		displayName: '<AbsoluteFill>',
		documentationLink: 'https://www.remotion.dev/docs/absolute-fill',
		from: 4,
		duration: 12,
		showInTimeline: true,
	});
	expect(registeredSequences[0]?.refForOutline?.current).toBe(element);
	expect(registeredSequences[0]?.controls?.componentIdentity).toBe(
		'dev.remotion.remotion.AbsoluteFill',
	);
	expect(registeredSequences[0]?.controls?.schema).toHaveProperty([
		'style.backgroundColor',
	]);
	expect(registeredSequences[0]?.controls?.schema).toHaveProperty('children');
});

test('Loading indicator does not register an interactive sequence', () => {
	const registeredSequences: TSequence[] = [];

	const {container, getByText} = render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Loading />
		</SequenceTestWrapper>,
	);

	expect(getByText('Resolving <Suspense>...')).toBeTruthy();
	expect(container.querySelector('#remotion-comp-loading')).toBeTruthy();
	expect(registeredSequences).toHaveLength(0);
});

test('Interactive elements inherit trimBefore from Sequence', () => {
	const Frame = () => {
		const frame = useCurrentFrame();
		return <span>{'frame' + frame}</span>;
	};

	const registeredSequences: TSequence[] = [];
	const {queryByText} = render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Interactive.Div trimBefore={7}>
				<Frame />
			</Interactive.Div>
		</SequenceTestWrapper>,
	);

	expect(queryByText('frame7')).not.toBe(null);
	expect(registeredSequences[0]?.displayName).toBe('<Interactive.Div>');
});

test('Imperative sequence refs update without rerendering ref-only consumers', async () => {
	const nodePath = {
		absolutePath: 'test.tsx',
		nodePath: ['root'],
		sequenceKeys: [],
		effectKeys: [],
		videoConfigValues: null,
	};
	let renders = 0;
	let sequencesRef: React.ContextType<typeof SequenceManagerRefContext> | null =
		null;
	let propStatusesRef: React.ContextType<
		typeof VisualModePropStatusesRefContext
	> | null = null;

	const RefOnlyConsumer = React.memo(() => {
		renders++;
		sequencesRef = React.useContext(SequenceManagerRefContext);
		propStatusesRef = React.useContext(VisualModePropStatusesRefContext);
		return null;
	});

	const Mutator = () => {
		const {registerSequence} = React.useContext(SequenceManager);
		const {setPropStatuses} = React.useContext(VisualModeSettersContext);

		React.useEffect(() => {
			registerSequence({id: 'imperative-sequence'} as TSequence);
			setPropStatuses(nodePath, () => ({
				canUpdate: true,
				props: {},
				effects: [],
			}));
		}, [registerSequence, setPropStatuses]);

		return null;
	};

	render(
		<SequenceManagerProvider>
			<RefOnlyConsumer />
			<Mutator />
		</SequenceManagerProvider>,
	);

	await waitFor(() => {
		expect(sequencesRef?.current).toHaveLength(1);
		expect(Object.keys(propStatusesRef?.current ?? {})).toHaveLength(1);
	});
	expect(renders).toBe(1);
});
