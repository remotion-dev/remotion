import {CanvasInternals} from '@remotion/sdk';
import {useContext, useRef} from 'react';
import {Internals} from 'remotion';

type TimelineInput = Parameters<typeof CanvasInternals.calculateTimeline>[0];
type TimelineTracks = ReturnType<typeof CanvasInternals.calculateTimeline>;
type Compositions = NonNullable<TimelineInput['compositions']>;
const emptyCompositions: Compositions = [];

// Registry snapshots are immutable and belong to one preview root. Weak keys
// let interactions share its calculated tracks without retaining old snapshots.
const timelinesBySnapshot = new WeakMap<
	TimelineInput['sequences'],
	WeakMap<
		TimelineInput['overrideIdsToNodePaths'],
		WeakMap<Compositions, Map<boolean, TimelineTracks>>
	>
>();

const findCachedTimeline = (input: TimelineInput) => {
	return timelinesBySnapshot
		.get(input.sequences)
		?.get(input.overrideIdsToNodePaths)
		?.get(input.compositions?.length ? input.compositions : emptyCompositions)
		?.get(input.showConnectedCompositionChildren ?? false);
};

const cacheTimelineCalculation = (
	input: TimelineInput,
	tracks: TimelineTracks,
) => {
	const byMapping = timelinesBySnapshot.get(input.sequences) ?? new WeakMap();
	const byCompositions =
		byMapping.get(input.overrideIdsToNodePaths) ?? new WeakMap();
	const compositions = input.compositions?.length
		? input.compositions
		: emptyCompositions;
	const byVisibility = byCompositions.get(compositions) ?? new Map();
	byVisibility.set(input.showConnectedCompositionChildren ?? false, tracks);
	byCompositions.set(compositions, byVisibility);
	byMapping.set(input.overrideIdsToNodePaths, byCompositions);
	timelinesBySnapshot.set(input.sequences, byMapping);
};

export const calculateTimeline = (input: TimelineInput): TimelineTracks => {
	const cached = findCachedTimeline(input);
	if (cached) {
		return cached;
	}

	const tracks = CanvasInternals.calculateTimeline(input);
	// Ad hoc callers may mutate their input between calls. Only retain results
	// for immutable registry snapshots already published by a retained calculator.
	if (timelinesBySnapshot.has(input.sequences)) {
		cacheTimelineCalculation(input, tracks);
	}

	return tracks;
};

export const createTimelineCalculator = () => {
	const calculate = CanvasInternals.createTimelineCalculator();
	return (input: TimelineInput) => {
		const result = calculate(input);
		cacheTimelineCalculation(input, result.tracks);
		return result;
	};
};

export const useTimelineCalculator = () => {
	const registry = useContext(Internals.SequenceRegistryContext);
	const calculator = useRef<{
		readonly registry: typeof registry;
		readonly calculate: ReturnType<typeof createTimelineCalculator>;
	} | null>(null);
	if (calculator.current === null || calculator.current.registry !== registry) {
		calculator.current = {registry, calculate: createTimelineCalculator()};
	}

	return calculator.current.calculate;
};
