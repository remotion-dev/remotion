import type {CanvasSelectionSnapshot} from '@remotion/sdk';
import type {TimelineSelection} from './TimelineSelection';

export type KeyframeFieldState = {
	readonly keyframes: readonly {frame: number; value: unknown}[];
	readonly easingSegments: readonly {
		readonly fromFrame: number;
		readonly toFrame: number;
		readonly segmentIndex: number;
	}[];
	readonly canEditEasing: boolean;
};

const isSameKeyframeValue = (a: unknown, b: unknown) =>
	JSON.stringify(a) === JSON.stringify(b);

const getKeyframeFrame = ({
	frame,
	previous,
	current,
}: {
	readonly frame: number;
	readonly previous: KeyframeFieldState | undefined;
	readonly current: KeyframeFieldState;
}): number | null => {
	const currentKeyframe = current.keyframes.find(
		(keyframe) => keyframe.frame === frame,
	);

	if (previous === undefined) {
		return currentKeyframe ? frame : null;
	}

	const previousIndex = previous.keyframes.findIndex(
		(keyframe) => keyframe.frame === frame,
	);
	if (previousIndex === -1) {
		// The selection was created after the previous source snapshot.
		return currentKeyframe ? frame : null;
	}

	const previousValue = previous.keyframes[previousIndex].value;
	if (
		currentKeyframe &&
		isSameKeyframeValue(currentKeyframe.value, previousValue)
	) {
		return frame;
	}

	// The frame may now hold a different keyframe whose range overlapped the
	// moved one. Match by value within the equal-value group so both keep
	// their identities.
	const valueOrdinal = previous.keyframes
		.slice(0, previousIndex)
		.filter((keyframe) =>
			isSameKeyframeValue(keyframe.value, previousValue),
		).length;
	const sameValue = current.keyframes.filter((keyframe) =>
		isSameKeyframeValue(keyframe.value, previousValue),
	);
	const matched = sameValue[valueOrdinal];
	if (matched) {
		return matched.frame;
	}

	// A move does not change the number of keyframes. Fall back to the
	// position when the value was edited in place or equal values crossed.
	// shortcut: equal-valued keyframes that cross are matched by order.
	if (previous.keyframes.length === current.keyframes.length) {
		return current.keyframes[previousIndex]?.frame ?? null;
	}

	return null;
};

/**
 * Keeps keyframe and easing selections attached to the same keyframes after
 * the source changes (Undo/Redo). Selections whose keyframes or segments no
 * longer exist are dropped.
 */
export const reconcileKeyframeSelection = ({
	previousFields,
	currentFields,
	getFieldKey,
	state,
}: {
	readonly previousFields: ReadonlyMap<string, KeyframeFieldState>;
	readonly currentFields: ReadonlyMap<string, KeyframeFieldState>;
	readonly getFieldKey: (item: TimelineSelection) => string;
	readonly state: CanvasSelectionSnapshot;
}): CanvasSelectionSnapshot => {
	const mapItem = (
		item: TimelineSelection | null,
	): TimelineSelection | null => {
		if (item === null || (item.type !== 'keyframe' && item.type !== 'easing')) {
			return item;
		}

		const fieldKey = getFieldKey(item);
		const current = currentFields.get(fieldKey);
		if (current === undefined) {
			// A missing track or a pending update does not prove that the
			// selection is gone.
			return item;
		}

		const previous = previousFields.get(fieldKey);
		if (item.type === 'keyframe') {
			const frame = getKeyframeFrame({
				frame: item.frame,
				previous,
				current,
			});
			if (frame === null) {
				return null;
			}

			return frame === item.frame ? item : {...item, frame};
		}

		if (!current.canEditEasing) {
			return null;
		}

		const fromFrame = getKeyframeFrame({
			frame: item.fromFrame,
			previous,
			current,
		});
		const toFrame = getKeyframeFrame({
			frame: item.toFrame,
			previous,
			current,
		});
		if (fromFrame === null || toFrame === null) {
			return null;
		}

		const segment = current.easingSegments.find(
			(candidate) =>
				candidate.fromFrame === fromFrame && candidate.toFrame === toFrame,
		);
		if (!segment) {
			return null;
		}

		return fromFrame === item.fromFrame &&
			toFrame === item.toFrame &&
			segment.segmentIndex === item.segmentIndex
			? item
			: {...item, fromFrame, toFrame, segmentIndex: segment.segmentIndex};
	};

	const selectedItems = state.selectedItems
		.map(mapItem)
		.filter((item): item is TimelineSelection => item !== null);
	const anchor = mapItem(state.anchor);
	if (
		anchor === state.anchor &&
		selectedItems.length === state.selectedItems.length &&
		selectedItems.every((item, index) => item === state.selectedItems[index])
	) {
		return state;
	}

	return {selectedItems, anchor};
};
