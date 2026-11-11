import {afterEach, expect, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import {useMemo} from 'react';
import {
	Internals,
	type InteractivitySchema,
	type PropStatuses,
	type SequencePropsSubscriptionKey,
} from 'remotion';
import {
	ExpandedTracksGetterContext,
	ExpandedTracksSetterContext,
} from '../components/ExpandedTracksProvider';
import {TimelineKeyframeTracksProvider} from '../components/Timeline/TimelineKeyframeTracksContext';
import {
	TimelineSelectableItemsProvider,
	TimelineSelectionProvider,
	useTimelineSelection,
	type TimelineSelection,
} from '../components/Timeline/TimelineSelection';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../helpers/get-timeline-sequence-sort-key';
import {KeybindingContextProvider} from '../state/keybindings';

afterEach(cleanup);

const nodePath: SequencePropsSubscriptionKey = {
	absolutePath: '/project/src/Comp.tsx',
	effectKeys: [],
	nodePath: ['body', 0],
	sequenceKeys: ['from', 'durationInFrames'],
	videoConfigValues: null,
};
const nodePathInfo: SequenceNodePathInfo = {
	sequenceSubscriptionKey: nodePath,
	auxiliaryKeys: [],
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	supportsEffects: true,
};
const opacityNodePathInfo: SequenceNodePathInfo = {
	...nodePathInfo,
	auxiliaryKeys: ['controls', 'opacity'],
};
const schema = {
	opacity: {type: 'number', default: 1, hiddenFromList: false},
} satisfies InteractivitySchema;

const makeTrack = (): TimelineTrackData => ({
	sequence: {
		type: 'sequence',
		from: 0,
		trimBefore: null,
		duration: 100,
		id: 'sequence',
		displayName: 'sequence',
		documentationLink: null,
		parent: null,
		showInTimeline: true,
		timelineOrder: null,
		singleChildComponent: undefined,
		loopDisplay: undefined,
		getStack: () => null,
		premountDisplay: null,
		postmountDisplay: null,
		controls: {
			schema,
			runtimeValues: {},
			overrideId: 'override',
			supportsEffects: true,
			componentIdentity: null,
			componentName: '<Sequence>',
			videoConfigValues: null,
		},
		refForOutline: null,
		isInsideSeries: false,
		effects: [],
		effectRuntimeValues: null,
		sequencePlaybackRate: 1,
		frozenFrame: null,
		startMediaFrom: 0,
	} as unknown as TimelineTrackData['sequence'],
	depth: 0,
	nodePathInfo,
	keyframeDisplayOffset: 0,
	keyframePlaybackRate: 1,
	sequenceFrameOffset: 0,
	cascadedStart: 0,
	localStart: 0,
	parentVisibleStart: 0,
	parentVisibleEnd: null,
});

const makeStatuses = (frames: readonly number[]): PropStatuses => ({
	[Internals.makeSequencePropsSubscriptionKey(nodePath)]: {
		durationDependentKeyframes: null,
		canUpdate: true,
		effects: [],
		props: {
			opacity:
				frames.length === 0
					? {
							status: 'static',
							codeValue: 1,
							keyframeDisplayOffsetAdjustment: null,
						}
					: {
							status: 'keyframed',
							interpolationFunction: 'interpolate',
							keyframeDisplayOffsetAdjustment: null,
							keyframes: frames.map((frame, index) => ({
								frame,
								value: index,
							})),
							easing: frames.slice(1).map(() => ({type: 'linear'})),
							clamping: {left: 'clamp', right: 'clamp'},
							posterize: undefined,
							output: undefined,
						},
		},
	},
});

const studioServerConnectionContext = {
	previewServerState: {type: 'connected', clientId: 'client'},
	configFileChangeRevision: 0,
	subscribeToEvent: () => () => undefined,
} as never;

const dragOverrides = {
	getDragOverrides: () => ({}),
	getEffectDragOverrides: () => ({}),
} as never;

const expandedTracksGetter = {getIsExpanded: () => false};

const expandedTracksSetter = {
	expandParentTracks: () => undefined,
	toggleTrack: () => undefined,
	migrateExpandedTracksForSubscriptionKey: () => undefined,
};

const Harness = ({
	statuses,
	onSelection,
}: {
	readonly statuses: PropStatuses;
	readonly onSelection: (
		selection: ReturnType<typeof useTimelineSelection>,
	) => void;
}) => {
	const track = useMemo(makeTrack, []);
	const propStatusesValue = useMemo(
		() => ({propStatuses: statuses}),
		[statuses],
	);
	const subscription = useMemo(
		() => ({
			subscribe: () => () => undefined,
			getSnapshot: (key: string | null) =>
				key === null ? null : (statuses[key] ?? null),
		}),
		[statuses],
	);
	return (
		<StudioServerConnectionCtx.Provider value={studioServerConnectionContext}>
			<ExpandedTracksGetterContext.Provider value={expandedTracksGetter}>
				<ExpandedTracksSetterContext.Provider value={expandedTracksSetter}>
					<Internals.VisualModePropStatusesContext.Provider
						value={propStatusesValue}
					>
						<Internals.VisualModePropStatusesSubscriptionContext.Provider
							value={subscription}
						>
							<Internals.VisualModeDragOverridesContext.Provider
								value={dragOverrides}
							>
								<KeybindingContextProvider>
									<TimelineSelectionProvider>
										<CaptureSelection onSelection={onSelection} />
										<TimelineKeyframeTracksProvider tracks={[track]}>
											<TimelineSelectableItemsProvider timeline={[track]}>
												{null}
											</TimelineSelectableItemsProvider>
										</TimelineKeyframeTracksProvider>
									</TimelineSelectionProvider>
								</KeybindingContextProvider>
							</Internals.VisualModeDragOverridesContext.Provider>
						</Internals.VisualModePropStatusesSubscriptionContext.Provider>
					</Internals.VisualModePropStatusesContext.Provider>
				</ExpandedTracksSetterContext.Provider>
			</ExpandedTracksGetterContext.Provider>
		</StudioServerConnectionCtx.Provider>
	);
};

const CaptureSelection = ({
	onSelection,
}: {
	readonly onSelection: (
		selection: ReturnType<typeof useTimelineSelection>,
	) => void;
}) => {
	onSelection(useTimelineSelection());
	return null;
};

const keyframeSelection = (frame: number): TimelineSelection => ({
	type: 'keyframe',
	nodePathInfo: opacityNodePathInfo,
	frame,
});

const getSelectedFrames = (
	selection: ReturnType<typeof useTimelineSelection>,
): number[] =>
	selection.selectedItems.flatMap((item) =>
		item.type === 'keyframe' ? [item.frame] : [],
	);

test('undoing a keyframe move keeps the selection on the restored keyframes', () => {
	let selection: ReturnType<typeof useTimelineSelection> | null = null;
	const capture = (value: ReturnType<typeof useTimelineSelection>) => {
		selection = value;
	};

	const {rerender} = render(
		<Harness statuses={makeStatuses([27, 37])} onSelection={capture} />,
	);
	act(() => {
		selection!.selectItems([keyframeSelection(27), keyframeSelection(37)]);
	});
	expect(getSelectedFrames(selection!)).toEqual([27, 37]);

	rerender(<Harness statuses={makeStatuses([30, 40])} onSelection={capture} />);

	expect(getSelectedFrames(selection!)).toEqual([30, 40]);
});

test('a selection made while the history operation is pending survives it', () => {
	let selection: ReturnType<typeof useTimelineSelection> | null = null;
	const capture = (value: ReturnType<typeof useTimelineSelection>) => {
		selection = value;
	};

	const {rerender} = render(
		<Harness statuses={makeStatuses([10, 30, 40])} onSelection={capture} />,
	);
	act(() => {
		selection!.selectItems([keyframeSelection(10)]);
	});

	rerender(
		<Harness statuses={makeStatuses([10, 27, 37])} onSelection={capture} />,
	);

	expect(getSelectedFrames(selection!)).toEqual([10]);
});

test('undoing keyframe creation removes the selection', () => {
	let selection: ReturnType<typeof useTimelineSelection> | null = null;
	const capture = (value: ReturnType<typeof useTimelineSelection>) => {
		selection = value;
	};

	const {rerender} = render(
		<Harness statuses={makeStatuses([30, 40])} onSelection={capture} />,
	);
	act(() => {
		selection!.selectItems([keyframeSelection(30), keyframeSelection(40)]);
	});
	expect(getSelectedFrames(selection!)).toEqual([30, 40]);

	rerender(<Harness statuses={makeStatuses([])} onSelection={capture} />);

	expect(selection!.selectedItems).toEqual([]);
});
