import type {TSequence} from 'remotion';
import type {TimelineTrackWithDisplayGroup} from './timeline-display-groups';
import type {TimelineDisplayRow} from './timeline-track-groups';

export type TimelineSceneRange = {
	readonly from: number;
	readonly end: number;
};

// Keep sequence rows and their identities intact. Only their vertical positions
// and virtualization groups change when consecutive scenes share child space.
export const getTimelineSeriesLayout = ({
	rows,
	heights,
	sequences,
	compactSeries,
	paddingStart,
}: {
	readonly rows: readonly TimelineDisplayRow[];
	readonly heights: readonly number[];
	readonly sequences: readonly TSequence[];
	readonly compactSeries: boolean;
	readonly paddingStart: number;
}) => {
	const byId = new Map(sequences.map((sequence) => [sequence.id, sequence]));
	const rowById = new Map(
		rows.map((row, index) => [row.track.sequence.id, index]),
	);
	const registeredItems = new Map<string, TSequence[]>();
	for (const sequence of sequences) {
		const track = sequence.timelineTrack;
		if (track && track.role !== 'track') {
			const items = registeredItems.get(track.id) ?? [];
			items.push(sequence);
			registeredItems.set(track.id, items);
		}
	}

	const scenesBySeries = new Map<number, TimelineTrackWithDisplayGroup[]>();
	const seriesByScene = new Map<string, number>();
	if (compactSeries) {
		for (let index = 0; index < rows.length; index++) {
			const row = rows[index];
			const track = row.track.sequence.timelineTrack;
			const registered = track ? registeredItems.get(track.id) : undefined;
			if (
				row.items === null ||
				row.items.length === 0 ||
				!registered ||
				registered.some(
					(item) =>
						item.timelineTrack?.role !== 'clip' ||
						item.timelineTrack.seriesOffset !== 0 ||
						!item.showInTimeline,
				)
			) {
				continue;
			}

			const scenes = [...row.items].sort(
				(a, b) => a.sequence.from - b.sequence.from,
			);
			if (
				scenes.some((scene, sceneIndex) => {
					const previous = scenes[sceneIndex - 1]?.sequence;
					return (
						previous && previous.from + previous.duration > scene.sequence.from
					);
				})
			) {
				continue;
			}

			scenesBySeries.set(index, scenes);
			for (const scene of scenes) {
				seriesByScene.set(scene.sequence.id, index);
			}
		}
	}

	const childrenByScene = new Map<string, number[]>();
	const roots: number[] = [];
	for (let index = 0; index < rows.length; index++) {
		let {parent} = rows[index].track.sequence;
		while (parent !== null && !seriesByScene.has(parent)) {
			parent = byId.get(parent)?.parent ?? null;
		}

		if (parent === null) {
			roots.push(index);
		} else {
			const children = childrenByScene.get(parent) ?? [];
			children.push(index);
			childrenByScene.set(parent, children);
		}
	}

	const offsets = new Array<number>(rows.length);
	const sceneRanges = new Array<TimelineSceneRange | null>(rows.length).fill(
		null,
	);
	const groupIndexes = new Array<number>(rows.length);
	const groups: {
		readonly index: number;
		readonly rows: number[];
		readonly height: number;
	}[] = [];
	const layoutRows = (
		indexes: readonly number[],
		start: number,
		range: TimelineSceneRange | null,
		groupRows: number[],
	): number => {
		let cursor = start;
		for (const index of indexes) {
			offsets[index] = cursor;
			sceneRanges[index] = range;
			groupIndexes[index] = groups.length;
			groupRows.push(index);
			cursor += heights[index];
			const scenes = scenesBySeries.get(index);
			if (!scenes) {
				continue;
			}

			let end = cursor;
			for (const {sequence} of scenes) {
				const sceneRange = {
					from: Math.max(range?.from ?? -Infinity, sequence.from),
					end: Math.min(
						range?.end ?? Infinity,
						sequence.from + sequence.duration,
					),
				};
				end = Math.max(
					end,
					layoutRows(
						childrenByScene.get(sequence.id) ?? [],
						cursor,
						sceneRange,
						groupRows,
					),
				);
			}

			cursor = end;
		}

		return cursor;
	};

	let tracksEnd = paddingStart;
	for (const index of roots) {
		const groupRows: number[] = [];
		const end = layoutRows([index], tracksEnd, null, groupRows);
		groups.push({index, rows: groupRows, height: end - tracksEnd});
		tracksEnd = end;
	}

	// Reordering still follows the actual sequence hierarchy, even when adjacent
	// visual rows belong to different scenes or have different nesting depths.
	const siblingCounts = new Map<string | null, number>();
	const siblingIndexes = rows.map(({track}) => {
		const index = siblingCounts.get(track.sequence.parent) ?? 0;
		siblingCounts.set(track.sequence.parent, index + 1);
		return index;
	});
	const subtreeEnds = offsets.map((offset, index) => offset + heights[index]);
	for (let index = 0; index < rows.length; index++) {
		let {parent} = rows[index].track.sequence;
		while (parent !== null) {
			const parentIndex = rowById.get(parent);
			if (parentIndex !== undefined) {
				subtreeEnds[parentIndex] = Math.max(
					subtreeEnds[parentIndex],
					offsets[index] + heights[index],
				);
			}

			parent = byId.get(parent)?.parent ?? null;
		}
	}

	return {
		offsets,
		sceneRanges,
		groupIndexes,
		groups,
		tracksEnd,
		siblingIndexes,
		afterDropLineOffsets: subtreeEnds.map((end, index) => end - offsets[index]),
	};
};
