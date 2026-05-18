import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import React, {createContext, useCallback, useMemo, useState} from 'react';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	loadPersistedBooleanMap,
	persistBooleanMap,
	toggleBooleanMapKey,
} from '../helpers/persist-boolean-map';

const nodePathInfoToExpandedKey = (info: SequenceNodePathInfo): string =>
	[
		stringifySequenceExpandedRowKey(info.sequenceSubscriptionKey),
		info.auxiliaryKeys.join('.'),
		info.index,
	].join('.');

const SESSION_STORAGE_KEY = 'remotion.editor.expandedTracks';

const loadExpandedTracks = () => {
	return loadPersistedBooleanMap({
		sessionStorageKey: SESSION_STORAGE_KEY,
		legacyLocalStorageKey: SESSION_STORAGE_KEY,
	});
};

export type GetIsExpanded = (nodePathInfo: SequenceNodePathInfo) => boolean;

type ExpandedTracksGetterContextValue = {
	readonly getIsExpanded: GetIsExpanded;
};

type ExpandedTracksSetterContextValue = {
	readonly toggleTrack: (nodePathInfo: SequenceNodePathInfo) => void;
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
	const [expandedTracks, setExpandedTracks] =
		useState<Record<string, boolean>>(loadExpandedTracks);

	const toggleTrack = useCallback((nodePathInfo: SequenceNodePathInfo) => {
		setExpandedTracks((prev) => {
			const key = nodePathInfoToExpandedKey(nodePathInfo);
			const next = toggleBooleanMapKey(prev, key);
			persistBooleanMap(SESSION_STORAGE_KEY, next);
			return next;
		});
	}, []);

	const getterValue = useMemo(
		(): ExpandedTracksGetterContextValue => ({
			getIsExpanded: (nodePathInfo) =>
				expandedTracks[nodePathInfoToExpandedKey(nodePathInfo)] ?? false,
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
