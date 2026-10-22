import {CanvasInternals} from '@remotion/sdk';
import {useContext, useMemo, type ContextType} from 'react';
import {Internals} from 'remotion';

type TimelineCalculator = ReturnType<
	typeof CanvasInternals.createTimelineCalculator
>;
type TimelineInput = Parameters<TimelineCalculator>[0];
type Compositions = NonNullable<TimelineInput['compositions']>;
const emptyCompositions: Compositions = [];
const calculatorsByRegistry = new WeakMap<
	NonNullable<ContextType<typeof Internals.SequenceRegistryContext>>,
	TimelineCalculator
>();

export const useTimelineCalculator = (): TimelineCalculator => {
	const registry = useContext(Internals.SequenceRegistryContext);
	return useMemo(() => {
		const existing =
			registry === null ? null : calculatorsByRegistry.get(registry);
		if (existing) {
			return existing;
		}

		// Consumers in one preview share retained models. Different composition
		// visibility settings need independent models of the same registrations.
		const calculatorsByConfiguration = new WeakMap<
			TimelineInput['overrideIdsToNodePaths'],
			WeakMap<Compositions, Map<boolean, TimelineCalculator>>
		>();
		const calculate: TimelineCalculator = (input) => {
			const compositions = input.compositions?.length
				? input.compositions
				: emptyCompositions;
			const showConnectedCompositionChildren =
				input.showConnectedCompositionChildren ?? false;
			let byCompositions = calculatorsByConfiguration.get(
				input.overrideIdsToNodePaths,
			);
			if (!byCompositions) {
				byCompositions = new WeakMap();
				calculatorsByConfiguration.set(
					input.overrideIdsToNodePaths,
					byCompositions,
				);
			}

			let byVisibility = byCompositions.get(compositions);
			if (!byVisibility) {
				byVisibility = new Map();
				byCompositions.set(compositions, byVisibility);
			}

			let calculator = byVisibility.get(showConnectedCompositionChildren);
			if (!calculator) {
				calculator = CanvasInternals.createTimelineCalculator();
				byVisibility.set(showConnectedCompositionChildren, calculator);
			}

			return calculator({
				...input,
				compositions,
				showConnectedCompositionChildren,
			});
		};

		if (registry !== null) {
			calculatorsByRegistry.set(registry, calculate);
		}

		return calculate;
	}, [registry]);
};
