import {afterAll, afterEach, beforeAll, expect, test} from 'bun:test';
import {GlobalRegistrator} from '@happy-dom/global-registrator';
import {cleanup, renderHook} from '@testing-library/react';
import type {
	CanUpdateSequencePropStatusKeyframed,
	PropStatuses,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {ExpandedTracksGetterContext} from '../components/ExpandedTracksProvider';
import {useExpandedTrackKeyframeRows} from '../components/Timeline/use-expanded-track-keyframe-rows';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';

beforeAll(() => {
	GlobalRegistrator.register();
});

afterEach(() => {
	cleanup();
});

afterAll(() => {
	GlobalRegistrator.unregister();
});

const makeSubscriptionKey = (
	overrides: Partial<SequencePropsSubscriptionKey> = {},
): SequencePropsSubscriptionKey => ({
	absolutePath: '/src/Composition.tsx',
	nodePath: ['root', 0],
	sequenceKeys: ['opacity'],
	effectKeys: [],
	videoConfigValues: null,
	...overrides,
});

const makeNodePathInfo = (
	overrides: Partial<SequenceNodePathInfo> = {},
): SequenceNodePathInfo => ({
	sequenceSubscriptionKey: makeSubscriptionKey(),
	auxiliaryKeys: [],
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	supportsEffects: false,
	...overrides,
});

const makeSequence = (opacity: number): TSequence => ({
	type: 'sequence',
	from: 0,
	trimBefore: null,
	duration: 100,
	id: 'sequence',
	displayName: 'Sequence',
	documentationLink: null,
	parent: null,
	showInTimeline: true,
	nonce: [[0, 0]],
	loopDisplay: undefined,
	getStack: () => null,
	refForOutline: null,
	isInsideSeries: false,
	premountDisplay: null,
	postmountDisplay: null,
	controls: {
		schema: {
			opacity: {
				type: 'number',
				default: 1,
				hiddenFromList: false,
			},
		},
		currentRuntimeValueDotNotation: {opacity},
		overrideId: 'sequence',
		supportsEffects: false,
		componentIdentity: null,
		componentName: '<Sequence>',
	},
	effects: [],
	frozenFrame: null,
});

const keyframedStatus: CanUpdateSequencePropStatusKeyframed = {
	status: 'keyframed',
	interpolationFunction: 'interpolate',
	keyframes: [
		{frame: 0, value: 0},
		{frame: 10, value: 1},
	],
	easing: [{type: 'linear'}],
	clamping: {left: 'extend', right: 'extend'},
	posterize: undefined,
	output: undefined,
};

const baseSubscriptionKey = makeSubscriptionKey();
const changedEffectKeysSubscriptionKey = makeSubscriptionKey({
	effectKeys: [['amount']],
});
const propStatuses: PropStatuses = Object.fromEntries(
	[baseSubscriptionKey, changedEffectKeysSubscriptionKey].map((key) => [
		Internals.makeSequencePropsSubscriptionKey(key),
		{
			canUpdate: true,
			props: {opacity: keyframedStatus},
			effects: [],
		},
	]),
);

const getDragOverrides = () => ({});
const getEffectDragOverrides = () => ({});

const wrapper: React.FC<{readonly children: React.ReactNode}> = ({
	children,
}) => (
	<Internals.VisualModePropStatusesContext.Provider value={{propStatuses}}>
		<Internals.VisualModeDragOverridesContext.Provider
			value={{getDragOverrides, getEffectDragOverrides}}
		>
			<ExpandedTracksGetterContext.Provider value={{getIsExpanded: () => true}}>
				{children}
			</ExpandedTracksGetterContext.Provider>
		</Internals.VisualModeDragOverridesContext.Provider>
	</Internals.VisualModePropStatusesContext.Provider>
);

test('expanded rows preserve node path references until their identity changes', () => {
	const {result, rerender} = renderHook(
		({sequence, nodePathInfo}) =>
			useExpandedTrackKeyframeRows({
				sequence,
				nodePathInfo,
				keyframeDisplayOffset: 0,
			}),
		{
			initialProps: {
				sequence: makeSequence(0),
				nodePathInfo: makeNodePathInfo(),
			},
			wrapper,
		},
	);

	expect(result.current.rows).toHaveLength(1);
	const firstNodePathInfo = result.current.rows[0]?.nodePathInfo;

	rerender({
		sequence: makeSequence(0.5),
		nodePathInfo: makeNodePathInfo(),
	});
	expect(result.current.rows[0]?.nodePathInfo).toBe(firstNodePathInfo);

	const identityChanges: SequenceNodePathInfo[] = [
		makeNodePathInfo({auxiliaryKeys: ['nested']}),
		makeNodePathInfo({index: 1}),
		makeNodePathInfo({
			sequenceSubscriptionKey: changedEffectKeysSubscriptionKey,
		}),
		makeNodePathInfo({
			sequenceSubscriptionKey: makeSubscriptionKey({
				videoConfigValues: {
					durationInFrames: 100,
					fps: 30,
					height: 1080,
					width: 1920,
				},
			}),
		}),
		makeNodePathInfo({supportsEffects: true}),
	];

	for (const changedNodePathInfo of identityChanges) {
		rerender({
			sequence: makeSequence(0.5),
			nodePathInfo: makeNodePathInfo(),
		});
		const stableNodePathInfo = result.current.rows[0]?.nodePathInfo;

		rerender({
			sequence: makeSequence(0.5),
			nodePathInfo: changedNodePathInfo,
		});
		expect(result.current.rows[0]?.nodePathInfo).not.toBe(stableNodePathInfo);
	}
});
