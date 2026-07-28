import {useState, useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import type {
	OverrideIdToNodePaths,
	OverrideToNodePathGetters,
	OverrideToNodeSetters,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';

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
	const [overrideToNodePathMap, setOverrideIdToNodePathMap] =
		useState<OverrideIdToNodePaths>({});
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
				if (existing && existing === state) {
					return prev;
				}

				return {...prev, [overrideId]: state};
			});
		},
		[],
	);

	const getters = useMemo((): OverrideToNodePathGetters => {
		return {
			overrideIdToNodePathMappings:
				readOnlyOverrideToNodePathMap ?? overrideToNodePathMap,
		};
	}, [overrideToNodePathMap, readOnlyOverrideToNodePathMap]);

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
