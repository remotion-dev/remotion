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
						(item.timelineTrack?.role === 'clip' &&
							item.timelineTrack.seriesOffset !== 0) ||
						!item.showInTimeline,
				)
			) {
				continue;
			}

			const scenes = row.items
				.filter(
					({sequence}) =>
						sequence.timelineTrack?.role === 'clip' ||
						sequence.timelineTrack?.role === 'overlay',
				)
				.sort((a, b) => a.sequence.from - b.sequence.from);

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

			// Overlay contents get their own space below the scene contents.
			for (const role of ['clip', 'overlay'] as const) {
				const lanes: {end: number; height: number}[] = [];
				const placements: {lane: number; rows: number[]}[] = [];
				for (const {sequence} of scenes) {
					if (sequence.timelineTrack?.role !== role) {
						continue;
					}

					const sceneRange = {
						from: Math.max(range?.from ?? -Infinity, sequence.from),
						end: Math.min(
							range?.end ?? Infinity,
							sequence.from + sequence.duration,
						),
					};
					const firstRow = groupRows.length;
					const end = layoutRows(
						childrenByScene.get(sequence.id) ?? [],
						cursor,
						sceneRange,
						groupRows,
					);
					let lane = lanes.findIndex((item) => item.end <= sceneRange.from);
					if (lane === -1) {
						lane = lanes.length;
						lanes.push({end: sceneRange.end, height: end - cursor});
					} else {
						lanes[lane].end = sceneRange.end;
						lanes[lane].height = Math.max(lanes[lane].height, end - cursor);
					}

					placements.push({lane, rows: groupRows.slice(firstRow)});
				}

				// Assign lanes even to dormant scenes without registered children.
				// Reserve the largest child stack in every lane: otherwise a lane
				// collapses when its scene unmounts and moves a still-active scene.
				const laneHeight = Math.max(0, ...lanes.map((lane) => lane.height));

				for (const placement of placements) {
					for (const childIndex of placement.rows) {
						offsets[childIndex] += placement.lane * laneHeight;
					}
				}

				cursor += lanes.length * laneHeight;
			}
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
