import React, {createContext, useCallback, useMemo, useState} from 'react';
import type {SequenceNodePath} from 'remotion';

const nodePathToKey = (nodePath: SequenceNodePath): string =>
	JSON.stringify(nodePath);

export type GetIsExpanded = (nodePath: SequenceNodePath) => boolean;

type ExpandedTracksGetterContextValue = {
	readonly getIsExpanded: GetIsExpanded;
};

type ExpandedTracksSetterContextValue = {
	readonly toggleTrack: (nodePath: SequenceNodePath) => void;
};

export const ExpandedTracksGetterContext =
	createContext<ExpandedTracksGetterContextValue>({
		getIsExpanded: () => {
			throw new Error('ExpandedTracksGetterContext not initialized');
		},
	});

export const ExpandedTracksSetterContext =
	createContext<ExpandedTracksSetterContextValue>({
		toggleTrack: () => {
			throw new Error('ExpandedTracksSetterContext not initialized');
		},
	});

export const ExpandedTracksProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>(
		{},
	);

	const toggleTrack = useCallback((nodePath: SequenceNodePath) => {
		setExpandedTracks((prev) => {
			const key = nodePathToKey(nodePath);
			return {...prev, [key]: !prev[key]};
		});
	}, []);

	const getterValue = useMemo(
		(): ExpandedTracksGetterContextValue => ({
			getIsExpanded: (nodePath) =>
				expandedTracks[nodePathToKey(nodePath)] ?? false,
		}),
		[expandedTracks],
	);

	const setterValue = useMemo(
		(): ExpandedTracksSetterContextValue => ({toggleTrack}),
		[toggleTrack],
	);

	return (
		<ExpandedTracksSetterContext.Provider value={setterValue}>
			<ExpandedTracksGetterContext.Provider value={getterValue}>
				{children}
			</ExpandedTracksGetterContext.Provider>
		</ExpandedTracksSetterContext.Provider>
	);
};
