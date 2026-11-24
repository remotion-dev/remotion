import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import type {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';

export const remapKeyframeSelectionFrame = (
	keyframeEdits: NonNullable<SequenceNodePathRemapping['keyframeEdits']>,
	field: ReturnType<typeof parseKeyframeFieldFromNodePath>,
	frame: number | null,
): number | null => {
	let remapped = frame;
	for (const edit of keyframeEdits) {
		if (
			field !== null &&
			(edit.key !== field.fieldKey ||
				edit.effectIndex !==
					(field.type === 'effect' ? field.effectIndex : null))
		) {
			continue;
		}

		if (remapped === edit.frame) {
			remapped = edit.movedTo;
		}
	}

	return remapped;
};
