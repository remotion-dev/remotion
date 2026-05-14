import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import React, {createContext, useCallback, useMemo, useState} from 'react';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';

const nodePathInfoToKey = (info: SequenceNodePathInfo): string =>
	[
		stringifySequenceSubscriptionKey(info.sequenceSubscriptionKey),
		info.auxiliaryKeys.join('.'),
		info.index,
	].join('.');

const LOCAL_STORAGE_KEY = 'remotion.editor.expandedTracks';

const loadExpandedTracks = (): Record<string, boolean> => {
	if (typeof window === 'undefined') {
		return {};
	}

	const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
	if (item === null) {
		return {};
	}

	try {
		const parsed = JSON.parse(item);
		if (parsed && typeof parsed === 'object') {
			return parsed as Record<string, boolean>;
		}

		return {};
	} catch {
		return {};
	}
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
			const key = nodePathInfoToKey(nodePathInfo);
			const next = {...prev, [key]: !prev[key]};
			window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
			return next;
		});
	}, []);

	const getterValue = useMemo(
		(): ExpandedTracksGetterContextValue => ({
			getIsExpanded: (nodePathInfo) =>
				expandedTracks[nodePathInfoToKey(nodePathInfo)] ?? false,
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
