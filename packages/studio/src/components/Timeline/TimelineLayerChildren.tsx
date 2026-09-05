import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';
import type {TSequence} from 'remotion';
import {LIGHT_TEXT, TRANSPARENT, WHITE} from '../../helpers/colors';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../../helpers/hoverable';
import {toggleBooleanMapKey} from '../../helpers/persist-boolean-map';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import {TimelineCollapseToggle} from './TimelineCollapseToggle';
import {TimelineExpandArrowSpacer} from './TimelineExpandArrowButton';

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
	tracks: TimelineTrackData[],
	sequences: TSequence[],
	compositionId: string | null,
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
	const toggle = useCallback((key: string) => {
		setCollapsed((previous) => {
			const next = toggleBooleanMapKey(previous, key);
			try {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			} catch {
				// Keep the control usable when storage is unavailable.
			}

			return next;
		});
	}, []);
	const hierarchy = useMemo(() => {
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
		for (const track of tracks) {
			const parentIds: string[] = [];
			let {parent} = track.sequence;
			while (parent !== null && !parentIds.includes(parent)) {
				parentIds.push(parent);
				parents.add(parent);
				parent = byId.get(parent)?.parent ?? null;
			}

			ancestors.set(track.sequence.id, parentIds);
			// Source identity survives remounts. For layers without source metadata,
			// use the structural position instead of the ephemeral sequence ID.
			const identity = track.nodePathInfo
				? ['source', timelineNodePathInfoToKey(track.nodePathInfo)]
				: [
						'position',
						...[...parentIds]
							.reverse()
							.concat(track.sequence.id)
							.map((id) => siblingIndices.get(id)),
					];
			keys.set(track.sequence.id, JSON.stringify([compositionId, identity]));
		}

		return {keys, parents, ancestors};
	}, [compositionId, sequences, tracks]);
	const visibleTracks = useMemo(
		() =>
			tracks.filter((track) => {
				return !(hierarchy.ancestors.get(track.sequence.id) ?? []).some(
					(id) => {
						const key = hierarchy.keys.get(id);
						return key !== undefined && collapsed[key];
					},
				);
			}),
		[hierarchy, collapsed, tracks],
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
	return {visibleTracks, value};
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
		return <TimelineExpandArrowSpacer />;
	}

	const label = `${isCollapsed ? 'Expand' : 'Collapse'} children of ${sequence.displayName}`;
	return (
		<button
			type="button"
			className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
			aria-label={label}
			aria-expanded={!isCollapsed}
			title={label}
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
				border: 'none',
				padding: 0,
				cursor: 'default',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: 12,
				height: 16,
				marginRight: 0,
				flexShrink: 0,
			}}
		>
			<TimelineCollapseToggle collapsed={isCollapsed} color="currentColor" />
		</button>
	);
};
