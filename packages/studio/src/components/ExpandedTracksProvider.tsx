import React, {createContext, useCallback, useMemo, useState} from 'react';
import type {SequencePropsSubscriptionKey} from 'remotion';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {migrateExpandedTracksForSubscriptionKey} from '../helpers/migrate-expanded-tracks-for-subscription-key';
import {timelineNodePathInfoToKey} from '../helpers/timeline-node-path-key';

const SESSION_STORAGE_KEY = 'remotion.editor.expandedTracks';

const onlyCollapsedTrackValues = (
	state: Record<string, boolean>,
): Record<string, boolean> => {
	const result: Record<string, boolean> = {};

	for (const [key, value] of Object.entries(state)) {
		if (value === false) {
			result[key] = false;
		}
	}

	return result;
};

const loadExpandedTracks = () => {
	if (typeof window === 'undefined') {
		return {};
	}

	try {
		const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
		if (raw === null) {
			return {};
		}

		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== 'object') {
			return {};
		}

		return onlyCollapsedTrackValues(parsed as Record<string, boolean>);
	} catch {
		return {};
	}
};

const persistExpandedTracks = (state: Record<string, boolean>): void => {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		window.sessionStorage.setItem(
			SESSION_STORAGE_KEY,
			JSON.stringify(onlyCollapsedTrackValues(state)),
		);
	} catch {
		// Ignore quota errors or disabled storage.
	}
};

export type GetIsExpanded = (nodePathInfo: SequenceNodePathInfo) => boolean;

type ExpandedTracksGetterContextValue = {
	readonly getIsExpanded: GetIsExpanded;
};

type ExpandedTracksSetterContextValue = {
	readonly expandParentTracks: (nodePathInfo: SequenceNodePathInfo) => void;
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
		expandParentTracks: () => {
			throw new Error('ExpandedTracksSetterContext not initialized');
		},
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

	const expandParentTracks = useCallback(
		(nodePathInfo: SequenceNodePathInfo) => {
			const keysToExpand: string[] = [];

			for (let i = 0; i < nodePathInfo.auxiliaryKeys.length; i++) {
				keysToExpand.push(
					timelineNodePathInfoToKey({
						...nodePathInfo,
						auxiliaryKeys: nodePathInfo.auxiliaryKeys.slice(0, i),
					}),
				);
			}

			if (keysToExpand.length === 0) {
				return;
			}

			setExpandedTracks((prev) => {
				let changed = false;
				const next = {...prev};

				for (const key of keysToExpand) {
					if (next[key] === false) {
						delete next[key];
						changed = true;
					}
				}

				if (!changed) {
					return prev;
				}

				persistExpandedTracks(next);
				return next;
			});
		},
		[],
	);

	const toggleTrack = useCallback((nodePathInfo: SequenceNodePathInfo) => {
		setExpandedTracks((prev) => {
			const key = timelineNodePathInfoToKey(nodePathInfo);
			const next = {...prev};
			const isExpanded = next[key] ?? true;
			if (isExpanded) {
				next[key] = false;
			} else {
				delete next[key];
			}

			persistExpandedTracks(next);
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

				persistExpandedTracks(next);
				return next;
			});
		},
		[],
	);

	const getterValue = useMemo(
		(): ExpandedTracksGetterContextValue => ({
			getIsExpanded: (nodePathInfo) =>
				expandedTracks[timelineNodePathInfoToKey(nodePathInfo)] ?? true,
		}),
		[expandedTracks],
	);

	const setterValue = useMemo(
		(): ExpandedTracksSetterContextValue => ({
			expandParentTracks,
			toggleTrack,
			migrateExpandedTracksForSubscriptionKey: migrateExpandedTracks,
		}),
		[expandParentTracks, toggleTrack, migrateExpandedTracks],
	);

	return (
		<ExpandedTracksSetterContext.Provider value={setterValue}>
			<ExpandedTracksGetterContext.Provider value={getterValue}>
				{children}
			</ExpandedTracksGetterContext.Provider>
		</ExpandedTracksSetterContext.Provider>
	);
};
