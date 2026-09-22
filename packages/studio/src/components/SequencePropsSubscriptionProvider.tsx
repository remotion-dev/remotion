import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import type {
	OverrideIdToNodePaths,
	OverrideToNodePathGetters,
	OverrideToNodeSetters,
	SequencePropsSubscriptionKey,
	TSequence,
} from 'remotion';

export const OverrideIdToNodePathMappingsRefContext = createContext<{
	readonly current: OverrideIdToNodePaths;
}>({current: {}});

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
	const overrideIdToNodePathMappings =
		readOnlyOverrideToNodePathMap ?? overrideToNodePathMap;
	const overrideIdToNodePathMappingsRef = useRef(overrideIdToNodePathMappings);
	overrideIdToNodePathMappingsRef.current = overrideIdToNodePathMappings;

	const setOverrideIdToNodePath = useCallback(
		(overrideId: string, state: SequencePropsSubscriptionKey | null) => {
			setOverrideIdToNodePathMap((prev) => {
				const existing = prev[overrideId];
				if (state === null) {
					if (!existing) {
						return prev;
					}

					const next = {...prev};
					delete next[overrideId];
					return next;
				}

				if (existing && existing === state) {
					return prev;
				}

				return {...prev, [overrideId]: state};
			});
		},
		[],
	);

	const getters = useMemo((): OverrideToNodePathGetters => {
		return {overrideIdToNodePathMappings};
	}, [overrideIdToNodePathMappings]);

	const setters = useMemo((): OverrideToNodeSetters => {
		return {setOverrideIdToNodePath};
	}, [setOverrideIdToNodePath]);

	return (
		<OverrideIdToNodePathMappingsRefContext.Provider
			value={overrideIdToNodePathMappingsRef}
		>
			<Internals.OverrideIdsToNodePathsGettersContext.Provider value={getters}>
				<Internals.OverrideIdsToNodePathsSettersContext.Provider
					value={setters}
				>
					{children}
				</Internals.OverrideIdsToNodePathsSettersContext.Provider>
			</Internals.OverrideIdsToNodePathsGettersContext.Provider>
		</OverrideIdToNodePathMappingsRefContext.Provider>
	);
};
