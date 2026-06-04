import React, {createContext, useCallback, useMemo, useState} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {migrateExpandedTracksForSubscriptionKey} from '../helpers/migrate-expanded-tracks-for-subscription-key';
import {
	loadPersistedBooleanMap,
	persistBooleanMap,
	toggleBooleanMapKey,
} from '../helpers/persist-boolean-map';
import {timelineNodePathInfoToKey} from '../helpers/timeline-node-path-key';

const SESSION_STORAGE_KEY = 'remotion.editor.expandedTracks';

const loadExpandedTracks = () => {
	return loadPersistedBooleanMap(SESSION_STORAGE_KEY);
};

export type GetIsExpanded = (nodePathInfo: SequenceNodePathInfo) => boolean;

type ExpandedTracksGetterContextValue = {
	readonly getIsExpanded: GetIsExpanded;
};

type ExpandedTracksSetterContextValue = {
	readonly toggleTrack: (nodePathInfo: SequenceNodePathInfo) => void;
	readonly expandTracks: (
		nodePathInfos: readonly SequenceNodePathInfo[],
	) => void;
	readonly migrateExpandedTracksForSubscriptionKey: (
		oldKey: SequencePropsSubscriptionKey,
		newKey: SequencePropsSubscriptionKey,
	) => void;
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
		expandTracks: () => {
			throw new Error('ExpandedTracksSetterContext not initialized');
		},
		migrateExpandedTracksForSubscriptionKey: () => {
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
			const key = timelineNodePathInfoToKey(nodePathInfo);
			const next = toggleBooleanMapKey(prev, key);
			persistBooleanMap(SESSION_STORAGE_KEY, next);
			return next;
		});
	}, []);

	const expandTracks = useCallback(
		(nodePathInfos: readonly SequenceNodePathInfo[]) => {
			setExpandedTracks((prev) => {
				let next: Record<string, boolean> | null = null;

				for (const nodePathInfo of nodePathInfos) {
					const key = timelineNodePathInfoToKey(nodePathInfo);
					if (prev[key]) {
						continue;
					}

					next ??= {...prev};
					next[key] = true;
				}

				if (next === null) {
					return prev;
				}

				persistBooleanMap(SESSION_STORAGE_KEY, next);
				return next;
			});
		},
		[],
	);

	const migrateExpandedTracks = useCallback(
		(
			oldKey: SequencePropsSubscriptionKey,
			newKey: SequencePropsSubscriptionKey,
		) => {
			setExpandedTracks((prev) => {
				const next = migrateExpandedTracksForSubscriptionKey(
					prev,
					oldKey,
					newKey,
				);
				if (!next) {
					return prev;
				}

				persistBooleanMap(SESSION_STORAGE_KEY, next);
				return next;
			});
		},
		[],
	);

	const getterValue = useMemo(
		(): ExpandedTracksGetterContextValue => ({
			getIsExpanded: (nodePathInfo) =>
				expandedTracks[timelineNodePathInfoToKey(nodePathInfo)] ?? false,
		}),
		[expandedTracks],
	);

	const setterValue = useMemo(
		(): ExpandedTracksSetterContextValue => ({
			toggleTrack,
			expandTracks,
			migrateExpandedTracksForSubscriptionKey: migrateExpandedTracks,
		}),
		[toggleTrack, expandTracks, migrateExpandedTracks],
	);

	return (
		<ExpandedTracksSetterContext.Provider value={setterValue}>
			<ExpandedTracksGetterContext.Provider value={getterValue}>
				{children}
			</ExpandedTracksGetterContext.Provider>
		</ExpandedTracksSetterContext.Provider>
	);
};
