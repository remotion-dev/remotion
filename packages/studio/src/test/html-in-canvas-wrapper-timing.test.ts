import {expect, test} from 'bun:test';
import type {SequencePropsSubscriptionKey, TSequence} from 'remotion';
import {getHtmlInCanvasWrapperTiming} from '../components/InspectorPanel/get-html-in-canvas-wrapper-timing';
import {calculateTimeline} from '../helpers/calculate-timeline';
import {makeRuntimeValueStore} from './make-runtime-value-store';

const nodePath: SequencePropsSubscriptionKey = {
	absolutePath: '/src/Composition.tsx',
	nodePath: ['selected'],
	sequenceKeys: [],
	effectKeys: [],
	videoConfigValues: null,
};

const makeSequence = ({
	id,
	parent,
	from,
	duration = 100,
	trimBefore = null,
	sequencePlaybackRate = 1,
	selected = false,
}: {
	readonly id: string;
	readonly parent: string | null;
	readonly from: number;
	readonly duration?: number;
	readonly trimBefore?: number | null;
	readonly sequencePlaybackRate?: number;
	readonly selected?: boolean;
}): TSequence => ({
	controls: selected
		? {
				schema: {},
				runtimeValues: makeRuntimeValueStore({}),
				videoConfigValues: null,
				overrideId: 'selected',
				supportsEffects: false,
				componentIdentity: null,
				componentName: '<Sequence>',
			}
		: null,
	displayName: id,
	documentationLink: null,
	duration,
	effects: [],
	effectRuntimeValues: null,
	from,
	sequencePlaybackRate,
	frozenFrame: null,
	getStack: () => null,
	id,
	isInsideSeries: false,
	loopDisplay: undefined,
	parent,
	postmountDisplay: null,
	premountDisplay: null,
	customOutlineRef: null,
	refForOutline: null,
	showInTimeline: true,
	timelineOrder: null,
	trimBefore,
	type: 'sequence',
});

test('converts nested playback and trim into the parent clock', () => {
	const nestedTracks = calculateTimeline({
		sequences: [
			makeSequence({
				id: 'outer',
				parent: null,
				from: 10,
				trimBefore: 6,
				sequencePlaybackRate: 1.5,
			}),
			makeSequence({
				id: 'selected',
				parent: 'outer',
				from: 30,
				duration: 60,
				trimBefore: 8,
				sequencePlaybackRate: 2,
				selected: true,
			}),
		],
		overrideIdsToNodePaths: {selected: nodePath},
	});

	expect(
		getHtmlInCanvasWrapperTiming({
			tracks: nestedTracks,
			sequenceSubscriptionKey: nodePath,
		}),
	).toEqual({from: 30, durationInFrames: 60, trimBefore: 30});
});

test('clips wrapper timing to the parent visible range', () => {
	const parentClippedTracks = calculateTimeline({
		sequences: [
			makeSequence({
				id: 'parent',
				parent: null,
				from: 20,
				duration: 40,
			}),
			makeSequence({
				id: 'selected',
				parent: 'parent',
				from: -10,
				selected: true,
			}),
		],
		overrideIdsToNodePaths: {selected: nodePath},
	});

	expect(
		getHtmlInCanvasWrapperTiming({
			tracks: parentClippedTracks,
			sequenceSubscriptionKey: nodePath,
		}),
	).toEqual({from: 0, durationInFrames: 40, trimBefore: 0});
});
