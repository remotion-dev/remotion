import {stringifySequenceExpandedRowKey} from '@remotion/studio-shared';
import React, {createContext, useCallback, useMemo, useState} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {migrateExpandedTracksForSubscriptionKey} from '../helpers/migrate-expanded-tracks-for-subscription-key';
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
	return loadPersistedBooleanMap(SESSION_STORAGE_KEY);
};

export type GetIsExpanded = (nodePathInfo: SequenceNodePathInfo) => boolean;

type ExpandedTracksGetterContextValue = {
	readonly getIsExpanded: GetIsExpanded;
};

type ExpandedTracksSetterContextValue = {
	readonly toggleTrack: (nodePathInfo: SequenceNodePathInfo) => void;
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
			const key = nodePathInfoToExpandedKey(nodePathInfo);
			const next = toggleBooleanMapKey(prev, key);
			persistBooleanMap(SESSION_STORAGE_KEY, next);
			return next;
		});
	}, []);

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
				expandedTracks[nodePathInfoToExpandedKey(nodePathInfo)] ?? false,
		}),
		[expandedTracks],
	);

	const setterValue = useMemo(
		(): ExpandedTracksSetterContextValue => ({
			toggleTrack,
			migrateExpandedTracksForSubscriptionKey: migrateExpandedTracks,
		}),
		[toggleTrack, migrateExpandedTracks],
	);

	return (
		<ExpandedTracksSetterContext.Provider value={setterValue}>
			<ExpandedTracksGetterContext.Provider value={getterValue}>
				{children}
			</ExpandedTracksGetterContext.Provider>
		</ExpandedTracksSetterContext.Provider>
	);
};
