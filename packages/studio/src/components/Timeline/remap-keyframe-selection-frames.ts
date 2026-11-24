import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import type {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';

export const remapKeyframeSelectionFrame = (
	keyframeEdits: NonNullable<SequenceNodePathRemapping['keyframeEdits']>,
	field: ReturnType<typeof parseKeyframeFieldFromNodePath>,
	frame: number | null,
	tolerance = 0,
): number | null => {
	if (frame === null) {
		return null;
	}

	// Edits within one receipt apply simultaneously, so each input frame matches
	// at most one edit. Chained moves like 10 to 20 and 20 to 30 must remap 10
	// to 20, not to 30; only edits of later receipts may carry a frame further.
	for (const edit of keyframeEdits) {
		if (
			field !== null &&
			(edit.key !== field.fieldKey ||
				edit.effectIndex !==
					(field.type === 'effect' ? field.effectIndex : null))
		) {
			continue;
		}

		if (edit.frame !== null && Math.abs(edit.frame - frame) <= tolerance) {
			return edit.movedTo;
		}
	}

	return frame;
};
