import {
	addKeyframeToPropStatus,
	applyKeyframeSettingsToStatus,
	moveKeyframesInPropStatus,
	removeKeyframeFromPropStatus,
} from '@remotion/studio-shared';
import type {CanUpdateSequencePropStatus, DragOverrideValue} from 'remotion';
import type {CanvasKeyframeChange} from './keyframes';

/**
 * Shows a keyframe change on the canvas before the source is updated: how the
 * prop is written after the operation, for `controller.overrides.set()`.
 * `null` when the operation does not apply to the prop, for example an
 * easing of a prop that is not keyframed.
 */
export const getCanvasKeyframeChangeOverride = ({
	propStatus,
	change,
}: {
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly change: CanvasKeyframeChange;
}): DragOverrideValue | null => {
	const {operation} = change;
	if (operation.type === 'add') {
		const status = addKeyframeToPropStatus({
			status: propStatus,
			fieldKey: change.key,
			frame: operation.frame,
			value: operation.value,
			schema: change.schema,
		});
		return status.status === 'keyframed' ? {type: 'keyframed', status} : null;
	}

	if (propStatus.status !== 'keyframed') {
		return null;
	}

	switch (operation.type) {
		case 'remove': {
			const status = removeKeyframeFromPropStatus({
				status: propStatus,
				frame: operation.frame,
				valueWhenLastKeyframeDeleted: operation.valueWhenLastKeyframeDeleted,
			});
			if (status.status === 'keyframed') {
				return {type: 'keyframed', status};
			}

			return status.status === 'static'
				? {type: 'static', value: status.codeValue}
				: null;
		}

		case 'move': {
			const status = moveKeyframesInPropStatus({
				status: propStatus,
				moves: operation.moves,
			});
			return status.status === 'keyframed' ? {type: 'keyframed', status} : null;
		}

		case 'easing':
		case 'settings':
			return {
				type: 'keyframed',
				status: applyKeyframeSettingsToStatus(propStatus, operation),
			};

		default:
			throw new Error(
				`Unexpected keyframe operation: ${JSON.stringify(operation satisfies never)}`,
			);
	}
};
