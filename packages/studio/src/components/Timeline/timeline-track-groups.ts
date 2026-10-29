import type {TSequence} from 'remotion';
import {
	getTimelineLayerHeight,
	TIMELINE_ITEM_BORDER_BOTTOM,
} from '../../helpers/timeline-layout';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import type {TimelineTrackWithDisplayGroup} from './timeline-display-groups';

export const TIMELINE_PACKED_TRACK_HEIGHT = 28;
export const TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT = 24;
export const TIMELINE_TRACK_MEDIA_LABEL_HEIGHT = 16;

export const hasTimelineTrackMediaLabel = (sequence: TSequence): boolean =>
	sequence.timelineTrack?.role === 'clip' &&
	sequence.timelineTrack.seriesOffset === null &&
	(sequence.type === 'audio' ||
		sequence.type === 'video' ||
		sequence.type === 'image');

export const getTimelineSequenceHeight = (sequence: TSequence): number => {
	if (sequence.timelineTrack?.role === 'overlay') {
		return TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT - TIMELINE_ITEM_BORDER_BOTTOM;
	}

	if (
		sequence.timelineTrack &&
		(sequence.timelineTrack.role !== 'clip' ||
			sequence.timelineTrack.seriesOffset !== null)
	) {
		return TIMELINE_PACKED_TRACK_HEIGHT;
	}

	return (
		getTimelineLayerHeight(sequence.type) +
		(hasTimelineTrackMediaLabel(sequence)
			? TIMELINE_TRACK_MEDIA_LABEL_HEIGHT
			: 0)
	);
};

export type TimelineDisplayRow = {
	readonly track: TimelineTrackWithDisplayGroup;
	// Clips painted in this row, or null when the row paints its own sequence.
	readonly items: readonly TimelineTrackWithDisplayGroup[] | null;
	// Scenes whose contents can share space below this row.
	readonly childScenes: readonly TimelineTrackWithDisplayGroup[] | null;
	readonly auxiliaryRows: readonly (readonly TimelineTrackWithDisplayGroup[])[];
};

export const filterTimelineTrackContents = (
	tracks: readonly TimelineTrackWithDisplayGroup[],
	sequences: readonly TSequence[],
	compactSeries: boolean,
): TimelineTrackWithDisplayGroup[] => {
	const byId = new Map(sequences.map((sequence) => [sequence.id, sequence]));
	const tracksById = new Map(tracks.map((track) => [track.sequence.id, track]));
	const scopedDisplayGroupCounts = new Map<string, number>();
	const hiddenSelfReferences = new Set<string>();
	if (compactSeries) {
		for (const {sequence} of tracks) {
			let parent = sequence.parent === null ? null : byId.get(sequence.parent);
			// Transition presentations insert hidden sequences around the scene.
			// Its visible parent clip still represents the component's own wrapper.
			while (parent && !parent.showInTimeline) {
				parent = parent.parent === null ? undefined : byId.get(parent.parent);
			}

			if (
				parent?.timelineTrack?.role === 'clip' &&
				tracksById.has(parent.id) &&
				parent.showInTimeline &&
				sequence.singleChildComponent !== null &&
				sequence.singleChildComponent !== undefined &&
				sequence.singleChildComponent === parent.singleChildComponent
			) {
				// The scene clip already represents this component's own wrapper.
				hiddenSelfReferences.add(sequence.id);
			}
		}
	}

	const visibleTracks = tracks.flatMap((track) => {
		if (hiddenSelfReferences.has(track.sequence.id)) {
			return [];
		}

		if (
			track.sequence.timelineTrack?.role === 'clip' &&
			!track.sequence.showInTimeline
		) {
			return [];
		}

		let {parent} = track.sequence;
		let hiddenAncestors = 0;
		let nearestPackedInstance: string | null = null;
		while (parent !== null) {
			const ancestor = byId.get(parent);
			if (!ancestor) {
				break;
			}

			if (hiddenSelfReferences.has(ancestor.id)) {
				hiddenAncestors += Number(ancestor.showInTimeline);
			}

			if (ancestor.timelineTrack) {
				if (
					ancestor.timelineTrack.role === 'track' &&
					(!ancestor.showInTimeline ||
						ancestor.loopDisplay !== undefined ||
						ancestor.frozenFrame !== null)
				) {
					// Repeated or frozen child clocks cannot be represented by one
					// advancing clip interval. Show the transformed container instead.
					return [];
				}

				if (ancestor.timelineTrack.role !== 'track') {
					hiddenAncestors += Number(ancestor.showInTimeline);
				}

				if (
					ancestor.timelineTrack.role !== 'track' &&
					(ancestor.timelineTrack.role !== 'clip' || ancestor.showInTimeline)
				) {
					if (nearestPackedInstance === null) {
						const nodePathInfo = tracksById.get(ancestor.id)?.nodePathInfo;
						nearestPackedInstance = nodePathInfo
							? `source:${timelineNodePathInfoToKey(nodePathInfo)}`
							: `instance:${ancestor.id}`;
					}
				}
			}

			parent = ancestor.parent;
		}

		let {displayGroup} = track;
		if (
			!track.sequence.timelineTrack &&
			nearestPackedInstance !== null &&
			displayGroup !== null
		) {
			// Shared child components in overlapping clips must remain visible
			// once per clip, while duplicates inside one clip still collapse.
			const key = `packed-descendant:${JSON.stringify([nearestPackedInstance, displayGroup.key])}`;
			scopedDisplayGroupCounts.set(
				key,
				(scopedDisplayGroupCounts.get(key) ?? 0) + 1,
			);
			displayGroup = {...displayGroup, key};
		}

		return [
			{
				...track,
				displayGroup,
				depth: Math.max(0, track.depth - hiddenAncestors),
			},
		];
	});

	return visibleTracks.map((track) => {
		if (track.displayGroup === null) {
			return track;
		}

		const numberOfSequences = scopedDisplayGroupCounts.get(
			track.displayGroup.key,
		);
		if (numberOfSequences === undefined) {
			return track;
		}

		return {
			...track,
			displayGroup: {...track.displayGroup, numberOfSequences},
		};
	});
};

export const getTimelineDisplayRows = (
	tracks: readonly TimelineTrackWithDisplayGroup[],
): TimelineDisplayRow[] => {
	const rows: TimelineDisplayRow[] = [];
	const groupedItems = new Map<string, TimelineTrackWithDisplayGroup[]>();
	for (const track of tracks) {
		const group = track.sequence.timelineTrack;
		if (!group || group.role === 'track') {
			continue;
		}

		const items = groupedItems.get(group.id) ?? [];
		items.push(track);
		groupedItems.set(group.id, items);
	}

	for (const track of tracks) {
		const group = track.sequence.timelineTrack;
		if (!group) {
			rows.push({track, items: null, childScenes: null, auxiliaryRows: []});
		} else if (group.role === 'clip' && group.seriesOffset === null) {
			// Regular Track clips have their own bars and expandable properties
			// below the container's row.
			rows.push({track, items: null, childScenes: null, auxiliaryRows: []});
		} else if (group.role === 'track') {
			const packed =
				track.sequence.controls?.componentIdentity !==
				'dev.remotion.remotion.Track';
			if (
				track.sequence.loopDisplay !== undefined ||
				track.sequence.frozenFrame !== null
			) {
				rows.push({
					track,
					items: packed ? [track] : null,
					childScenes: null,
					auxiliaryRows: [],
				});
				continue;
			}

			const items = groupedItems.get(group.id) ?? [];
			const auxiliaryRows: TimelineTrackWithDisplayGroup[][] = [];
			// Transitions paint over scene clips. Only overlays need extra rows.
			for (const item of items.filter(
				(candidate) => candidate.sequence.timelineTrack?.role === 'overlay',
			)) {
				const start = item.sequence.from;
				const end =
					item.sequence.from +
					item.sequence.duration +
					(item.sequence.postmountDisplay ?? 0);
				let rowIndex = 0;
				for (let index = 0; index < auxiliaryRows.length; index++) {
					const overlaps = auxiliaryRows[index].some(({sequence}) => {
						const otherStart = sequence.from;
						const otherEnd =
							sequence.from +
							sequence.duration +
							(sequence.postmountDisplay ?? 0);
						return start < otherEnd && otherStart < end;
					});
					if (overlaps) {
						// Later overlays paint above earlier ones. Keep them below every
						// overlapping overlay, even if a higher row has free space.
						rowIndex = index + 1;
					}
				}

				auxiliaryRows[rowIndex] ??= [];
				auxiliaryRows[rowIndex].push(item);
			}

			rows.push({
				track,
				items: packed ? items : null,
				childScenes: items,
				auxiliaryRows,
			});
		}
	}

	return rows;
};

// The input rows own membership and packing. Reuse previous snapshots only when
// their resolved tracks still match, including after a full layout calculation.
export const projectTimelineDisplayRows = ({
	rows,
	tracksById,
	previousRows,
}: {
	readonly rows: readonly TimelineDisplayRow[];
	readonly tracksById: ReadonlyMap<string, TimelineTrackWithDisplayGroup>;
	readonly previousRows: readonly TimelineDisplayRow[];
}): readonly TimelineDisplayRow[] => {
	const previousById =
		previousRows === rows
			? null
			: new Map(previousRows.map((row) => [row.track.sequence.id, row]));
	const updateTracks = (
		tracks: readonly TimelineTrackWithDisplayGroup[],
		previousTracks: readonly TimelineTrackWithDisplayGroup[] | null,
	): readonly TimelineTrackWithDisplayGroup[] => {
		let updatedTracks: TimelineTrackWithDisplayGroup[] | null = null;
		for (let index = 0; index < tracks.length; index++) {
			const track = tracksById.get(tracks[index].sequence.id) ?? tracks[index];
			if (track !== tracks[index]) {
				updatedTracks ??= [...tracks];
				updatedTracks[index] = track;
			}
		}

		const projected = updatedTracks ?? tracks;
		return previousTracks !== null &&
			previousTracks.length === projected.length &&
			previousTracks.every((track, index) => track === projected[index])
			? previousTracks
			: projected;
	};

	let updated: TimelineDisplayRow[] | null = null;
	for (let index = 0; index < rows.length; index++) {
		const row = rows[index];
		const previous = previousById?.get(row.track.sequence.id) ?? row;
		const track = tracksById.get(row.track.sequence.id) ?? row.track;
		const items =
			row.items === null ? null : updateTracks(row.items, previous.items);
		const childScenes =
			row.childScenes === null
				? null
				: updateTracks(row.childScenes, previous.childScenes);
		let auxiliaryRows: (readonly TimelineTrackWithDisplayGroup[])[] | null =
			null;
		for (
			let auxiliaryIndex = 0;
			auxiliaryIndex < row.auxiliaryRows.length;
			auxiliaryIndex++
		) {
			const auxiliaryRow = updateTracks(
				row.auxiliaryRows[auxiliaryIndex],
				previous.auxiliaryRows[auxiliaryIndex] ?? null,
			);
			if (auxiliaryRow !== row.auxiliaryRows[auxiliaryIndex]) {
				auxiliaryRows ??= [...row.auxiliaryRows];
				auxiliaryRows[auxiliaryIndex] = auxiliaryRow;
			}
		}

		const projectedAuxiliaryRows = auxiliaryRows ?? row.auxiliaryRows;
		const stableAuxiliaryRows =
			previous.auxiliaryRows.length === projectedAuxiliaryRows.length &&
			previous.auxiliaryRows.every(
				(auxiliaryRow, auxiliaryIndex) =>
					auxiliaryRow === projectedAuxiliaryRows[auxiliaryIndex],
			)
				? previous.auxiliaryRows
				: projectedAuxiliaryRows;
		const projected =
			track === previous.track &&
			items === previous.items &&
			childScenes === previous.childScenes &&
			stableAuxiliaryRows === previous.auxiliaryRows
				? previous
				: track === row.track &&
					  items === row.items &&
					  childScenes === row.childScenes &&
					  stableAuxiliaryRows === row.auxiliaryRows
					? row
					: {
							track,
							items,
							childScenes,
							auxiliaryRows: stableAuxiliaryRows,
						};
		if (projected === row) {
			continue;
		}

		updated ??= [...rows];
		updated[index] = projected;
	}

	return updated ?? rows;
};
