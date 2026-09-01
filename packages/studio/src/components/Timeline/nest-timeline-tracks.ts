export type NestedTimelineTrack<T> = {
	readonly track: T;
	readonly siblingIndex: number;
	readonly children: NestedTimelineTrack<T>[];
};

export const nestTimelineTracks = <T extends {readonly depth: number}>(
	timeline: readonly T[],
): NestedTimelineTrack<T>[] => {
	const roots: NestedTimelineTrack<T>[] = [];
	const stack: NestedTimelineTrack<T>[] = [];

	for (let trackIndex = 0; trackIndex < timeline.length; trackIndex++) {
		const track = timeline[trackIndex];
		while (
			stack.length > 0 &&
			stack[stack.length - 1].track.depth >= track.depth
		) {
			stack.pop();
		}

		const parent = stack[stack.length - 1];
		const siblings = parent ? parent.children : roots;
		const nestedTrack: NestedTimelineTrack<T> = {
			track,
			siblingIndex: siblings.length,
			children: [],
		};
		siblings.push(nestedTrack);

		stack.push(nestedTrack);
	}

	return roots;
};
