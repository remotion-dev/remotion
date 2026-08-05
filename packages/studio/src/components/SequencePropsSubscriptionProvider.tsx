import {useState, useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import type {
	OverrideIdToNodePaths,
	OverrideToNodePathGetters,
	OverrideToNodeSetters,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';
import {FastRefreshContext} from '../fast-refresh-context';

type OverrideToNodePathMapWithGeneration = Record<
	string,
	{
		generation: number;
		nodePath: SequencePropsSubscriptionKey;
	}
>;

export const getReadOnlyOverrideIdToNodePathMappings = (
	sequences: readonly TSequence[],
): OverrideIdToNodePaths => {
	return Object.fromEntries(
		sequences.flatMap((sequence) => {
			const overrideId = sequence.controls?.overrideId;
			if (!overrideId) {
				return [];
			}

			return [
				[
					overrideId,
					{
						absolutePath: '',
						effectKeys: [],
						nodePath: ['readonly-sequence', overrideId],
						sequenceKeys: [],
						videoConfigValues: null,
					} satisfies SequencePropsSubscriptionKey,
				],
			];
		}),
	);
};

export const SequencePropsSubscriptionProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {sequences} = useContext(Internals.SequenceManager);
	const {fastRefreshGeneration, isFastRefreshing} =
		useContext(FastRefreshContext);
	const [overrideToNodePathMap, setOverrideIdToNodePathMap] =
		useState<OverrideToNodePathMapWithGeneration>({});
	const readOnlyOverrideToNodePathMap = useMemo(
		() =>
			window.remotion_isReadOnlyStudio
				? getReadOnlyOverrideIdToNodePathMappings(sequences)
				: null,
		[sequences],
	);

	const setOverrideIdToNodePath = useCallback(
		(overrideId: string, state: SequencePropsSubscriptionKey) => {
			setOverrideIdToNodePathMap((prev) => {
				const existing = prev[overrideId];
				if (
					existing?.generation === fastRefreshGeneration &&
					existing.nodePath === state
				) {
					return prev;
				}

				return {
					...prev,
					[overrideId]: {generation: fastRefreshGeneration, nodePath: state},
				};
			});
		},
		[fastRefreshGeneration],
	);

	const activeOverrideToNodePathMap = useMemo((): OverrideIdToNodePaths => {
		if (isFastRefreshing) {
			return {};
		}

		return Object.fromEntries(
			Object.entries(overrideToNodePathMap).flatMap(([overrideId, mapping]) =>
				mapping.generation === fastRefreshGeneration
					? [[overrideId, mapping.nodePath]]
					: [],
			),
		);
	}, [fastRefreshGeneration, isFastRefreshing, overrideToNodePathMap]);

	const getters = useMemo((): OverrideToNodePathGetters => {
		return {
			overrideIdToNodePathMappings:
				readOnlyOverrideToNodePathMap ?? activeOverrideToNodePathMap,
		};
	}, [activeOverrideToNodePathMap, readOnlyOverrideToNodePathMap]);

	const setters = useMemo((): OverrideToNodeSetters => {
		return {setOverrideIdToNodePath};
	}, [setOverrideIdToNodePath]);

	return (
		<Internals.OverrideIdsToNodePathsGettersContext.Provider value={getters}>
			<Internals.OverrideIdsToNodePathsSettersContext.Provider value={setters}>
				{children}
			</Internals.OverrideIdsToNodePathsSettersContext.Provider>
		</Internals.OverrideIdsToNodePathsGettersContext.Provider>
	);
};
