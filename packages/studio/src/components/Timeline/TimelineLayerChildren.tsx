import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import type {TSequence} from 'remotion';
import {
	CURRENT_COLOR,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
} from '../../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../../helpers/hoverable';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import type {TimelineTrackWithDisplayGroup} from './timeline-display-groups';
import {getTimelineSeriesLayout} from './timeline-series-layout';
import {getTimelineDisplayRows} from './timeline-track-groups';
import {TimelineCollapseToggle} from './TimelineCollapseToggle';

// Reserve the same space before and after children register or unregister.
const toggleLayout: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: 12,
	height: 16,
	marginRight: 0,
	flexShrink: 0,
};

const STORAGE_KEY = 'remotion.editor.collapsedLayerChildren.v1';

const TimelineLayerChildrenContext = createContext<{
	readonly collapsed: Record<string, boolean>;
	readonly keys: Map<string, string>;
	readonly parents: Set<string>;
	readonly toggle: (key: string) => void;
} | null>(null);

export const TimelineLayerChildrenProvider =
	TimelineLayerChildrenContext.Provider;

export const useTimelineLayerChildren = (
	tracks: readonly TimelineTrackWithDisplayGroup[],
	layoutSnapshot: {
		readonly tracks: readonly TimelineTrackWithDisplayGroup[];
		readonly sequences: readonly TSequence[];
	},
	compositionId: string | null,
	compactSeries: boolean,
) => {
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
		try {
			const parsed: unknown = JSON.parse(
				window.localStorage.getItem(STORAGE_KEY) ?? '{}',
			);
			if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
				return {};
			}

			return Object.fromEntries(
				Object.entries(parsed).filter(
					([, storedValue]) => storedValue === true,
				),
			);
		} catch {
			return {};
		}
	});
	const hierarchy = useMemo(() => {
		const {tracks: layoutTracks, sequences} = layoutSnapshot;
		const byId = new Map(sequences.map((sequence) => [sequence.id, sequence]));
		const siblingIndices = new Map<string, number>();
		const siblingCounts = new Map<string | null, number>();
		for (const sequence of sequences) {
			const index = siblingCounts.get(sequence.parent) ?? 0;
			siblingIndices.set(sequence.id, index);
			siblingCounts.set(sequence.parent, index + 1);
		}

		const keys = new Map<string, string>();
		const parents = new Set<string>();
		const ancestors = new Map<string, string[]>();
		for (const track of layoutTracks) {
			const parentIds: string[] = [];
			let {parent} = track.sequence;
			while (parent !== null && !parentIds.includes(parent)) {
				parentIds.push(parent);
				parents.add(parent);
				parent = byId.get(parent)?.parent ?? null;
			}

			ancestors.set(track.sequence.id, parentIds);
			// Source identity survives remounts. While it is resolving, the stack
			// gives interactive layers a stable display identity.
			const identity = track.nodePathInfo
				? ['source', timelineNodePathInfoToKey(track.nodePathInfo)]
				: track.displayGroup
					? ['stack', track.displayGroup.key]
					: [
							'position',
							...[...parentIds]
								.reverse()
								.concat(track.sequence.id)
								.map((id) => siblingIndices.get(id)),
						];
			const key = JSON.stringify([compositionId, identity]);
			// Series clips have no child-collapse control. Regular Track clips
			// have their own child rows and can collapse their nested contents.
			if (
				!track.sequence.timelineTrack ||
				track.sequence.timelineTrack.role === 'track' ||
				(track.sequence.timelineTrack.role === 'clip' &&
					track.sequence.timelineTrack.seriesOffset === null)
			) {
				keys.set(track.sequence.id, key);
			}
		}

		return {keys, parents, ancestors, byId};
	}, [compositionId, layoutSnapshot]);
	const toggle = useCallback(
		(key: string) => {
			const affectedKeys = new Set([key]);
			if (compactSeries) {
				const rows = getTimelineDisplayRows(layoutSnapshot.tracks);
				const index = rows.findIndex(
					(row) => hierarchy.keys.get(row.track.sequence.id) === key,
				);
				// Find corresponding layers on click, before hiding any children.
				const layout = getTimelineSeriesLayout({
					rows,
					heights: rows.map(() => 1),
					sequences: layoutSnapshot.sequences,
					compactSeries,
					paddingStart: 0,
				});
				if (index !== -1 && layout.sceneRanges[index] !== null) {
					for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
						if (
							layout.sceneRanges[rowIndex] === null ||
							layout.groupIndexes[rowIndex] !== layout.groupIndexes[index] ||
							layout.offsets[rowIndex] !== layout.offsets[index]
						) {
							continue;
						}

						const candidateKey = hierarchy.keys.get(
							rows[rowIndex].track.sequence.id,
						);
						if (candidateKey !== undefined) {
							affectedKeys.add(candidateKey);
						}
					}
				}
			}

			setCollapsed((previous) => {
				const next = {...previous};
				for (const affectedKey of affectedKeys) {
					if (previous[key]) {
						delete next[affectedKey];
					} else {
						next[affectedKey] = true;
					}
				}

				try {
					window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				} catch {
					// Keep the control usable when storage is unavailable.
				}

				return next;
			});
		},
		[compactSeries, hierarchy, layoutSnapshot],
	);
	const visibleTrackIndexes = useMemo(
		() =>
			layoutSnapshot.tracks.flatMap((track, index) => {
				const hidden = (hierarchy.ancestors.get(track.sequence.id) ?? []).some(
					(id) => {
						// Keep packed Series bars when their contents collapse.
						// Regular Track clips have their own rows and collapse normally.
						const packedTrack = track.sequence.timelineTrack;
						if (
							packedTrack &&
							packedTrack.role !== 'track' &&
							(packedTrack.role !== 'clip' ||
								packedTrack.seriesOffset !== null) &&
							packedTrack.id === hierarchy.byId.get(id)?.timelineTrack?.id
						) {
							return false;
						}

						const key = hierarchy.keys.get(id);
						return key !== undefined && collapsed[key];
					},
				);
				return hidden ? [] : [index];
			}),
		[hierarchy, collapsed, layoutSnapshot],
	);
	const visibleTracks = useMemo(
		() => visibleTrackIndexes.map((index) => tracks[index]),
		[tracks, visibleTrackIndexes],
	);
	const visibleLayoutTracks = useMemo(
		() => visibleTrackIndexes.map((index) => layoutSnapshot.tracks[index]),
		[layoutSnapshot, visibleTrackIndexes],
	);
	const value = useMemo(
		() => ({
			collapsed,
			keys: hierarchy.keys,
			parents: hierarchy.parents,
			toggle,
		}),
		[collapsed, hierarchy, toggle],
	);
	return {visibleTracks, visibleLayoutTracks, value};
};

export const TimelineLayerChildrenToggle: React.FC<{
	readonly sequence: TSequence;
}> = ({sequence}) => {
	const context = useContext(TimelineLayerChildrenContext);
	const key = context?.keys.get(sequence.id);
	const isCollapsed = key !== undefined && Boolean(context?.collapsed[key]);
	const onClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			if (key !== undefined) {
				context?.toggle(key);
			}
		},
		[context, key],
	);
	const stopPropagation = useCallback(
		(event: React.SyntheticEvent) => event.stopPropagation(),
		[],
	);
	if (!context?.parents.has(sequence.id) || key === undefined) {
		return <div style={toggleLayout} />;
	}

	const label = `${isCollapsed ? 'Expand' : 'Collapse'} children of ${sequence.displayName}`;
	return (
		<button
			type="button"
			className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
			aria-label={label}
			aria-expanded={!isCollapsed}
			onClick={onClick}
			onPointerDown={stopPropagation}
			onDoubleClick={stopPropagation}
			style={{
				...hoverableStyle({
					idleBackground: TRANSPARENT,
					hoverBackground: TRANSPARENT,
					idleColor: LIGHT_TEXT,
					hoverColor: WHITE,
				}),
				...toggleLayout,
				border: 'none',
				padding: 0,
				cursor: 'default',
			}}
		>
			<TimelineCollapseToggle collapsed={isCollapsed} color={CURRENT_COLOR} />
		</button>
	);
};
