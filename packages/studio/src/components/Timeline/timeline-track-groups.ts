import type {TSequence} from 'remotion';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import type {TimelineTrackWithDisplayGroup} from './timeline-display-groups';

export const TIMELINE_PACKED_TRACK_HEIGHT = 28;
export const TIMELINE_PACKED_AUXILIARY_ROW_HEIGHT = 24;

export type TimelineDisplayRow = {
	readonly track: TimelineTrackWithDisplayGroup;
	readonly items: readonly TimelineTrackWithDisplayGroup[] | null;
	readonly auxiliaryRows: readonly (readonly TimelineTrackWithDisplayGroup[])[];
};

export const filterTimelineTrackContents = (
	tracks: readonly TimelineTrackWithDisplayGroup[],
	sequences: readonly TSequence[],
): TimelineTrackWithDisplayGroup[] => {
	const byId = new Map(sequences.map((sequence) => [sequence.id, sequence]));
	const tracksById = new Map(tracks.map((track) => [track.sequence.id, track]));
	const scopedDisplayGroupCounts = new Map<string, number>();

	const visibleTracks = tracks.flatMap((track) => {
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
			rows.push({track, items: null, auxiliaryRows: []});
		} else if (group.role === 'track') {
			if (
				track.sequence.loopDisplay !== undefined ||
				track.sequence.frozenFrame !== null
			) {
				rows.push({track, items: [track], auxiliaryRows: []});
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

			rows.push({track, items, auxiliaryRows});
		}
	}

	return rows;
};
