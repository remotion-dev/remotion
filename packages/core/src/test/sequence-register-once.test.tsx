import {afterEach, expect, test} from 'bun:test';
import {cleanup, render, waitFor} from '@testing-library/react';
import React, {useCallback, useMemo, useState} from 'react';
import {AnimatedImage} from '../animated-image/index.js';
import type {TSequence} from '../CompositionManager.js';
import {Img} from '../Img.js';
import {Interactive} from '../Interactive.js';
import {Internals} from '../internals.js';
import {Sequence} from '../Sequence.js';
import type {SequenceManagerContext} from '../SequenceManager.js';
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
import {WrapSequenceContext} from './wrap-sequence-context.js';

afterEach(cleanup);

const SequenceTestWrapper: React.FC<{
	readonly children: React.ReactNode;
	readonly onRegisterSequence: (sequence: TSequence) => void;
	readonly rerenderOnRegister?: boolean;
}> = ({children, onRegisterSequence, rerenderOnRegister = false}) => {
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
			propStatuses: {},
		}),
		[],
	);

	const visualDragOverrides = useMemo(
		() => ({
			getDragOverrides: () => {
				throw new Error('VisualModeDragOverridesContext not initialized');
			},
			getEffectDragOverrides: () => {
				throw new Error('VisualModeDragOverridesContext not initialized');
			},
		}),
		[],
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
		<WrapSequenceContext>
			<Internals.RemotionEnvironmentContext
				value={{
					isRendering: false,
					isClientSideRendering: false,
					isPlayer: false,
					isStudio: true,
					isReadOnlyStudio: false,
				}}
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
			</Internals.RemotionEnvironmentContext>
		</WrapSequenceContext>
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
		rootId: 'test-root',
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

test('Series.Sequence registers without visual controls', () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Series>
				<Series.Sequence durationInFrames={10} premountFor={30}>
					First
				</Series.Sequence>
				<Series.Sequence durationInFrames={20}>Second</Series.Sequence>
			</Series>
		</SequenceTestWrapper>,
	);

	const seriesSequences = registeredSequences.filter(
		(sequence) => sequence.displayName === '<Series.Sequence>',
	);

	expect(seriesSequences).toHaveLength(2);
	for (const sequence of seriesSequences) {
		expect(sequence.controls).toBe(null);
	}
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
	const documentationLink = 'https://www.remotion.dev/docs/interactive';

	render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<Interactive.Div ref={divRef}>Hello</Interactive.Div>
			<Interactive.Span>World</Interactive.Span>
			<Interactive.Svg viewBox="0 0 100 100">
				<Interactive.Rect width={100} height={100} />
			</Interactive.Svg>
		</SequenceTestWrapper>,
	);

	expect(
		registeredSequences.map((sequence) => sequence.displayName).sort(),
	).toEqual([
		'<Interactive.Div>',
		'<Interactive.Rect>',
		'<Interactive.Span>',
		'<Interactive.Svg>',
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
