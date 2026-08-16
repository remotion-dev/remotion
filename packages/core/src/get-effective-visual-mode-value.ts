import {interpolateKeyframedStatus} from './interpolate-keyframed-status';
import type {
	CanUpdateSequencePropStatusKeyframed,
	CanUpdateSequencePropStatusStatic,
	DragOverrideValue,
} from './use-schema';

export type ResolvedDragOverrideValue =
	| {
			readonly type: 'none';
	  }
	| {
			readonly type: 'resolved';
			readonly value: unknown;
	  };

export const resolveDragOverrideValue = ({
	dragOverrideValue,
}: {
	dragOverrideValue: DragOverrideValue | undefined;
}): ResolvedDragOverrideValue => {
	if (dragOverrideValue === undefined) {
		return {type: 'none'};
	}

	if (dragOverrideValue.type === 'static') {
		return {type: 'resolved', value: dragOverrideValue.value};
	}

	const interpolated = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame: dragOverrideValue.sourceFrame,
		status: dragOverrideValue.status,
	});
	if (interpolated === null) {
		return {type: 'none'};
	}

	return {type: 'resolved', value: interpolated};
};

export const getEffectiveVisualModeValue = ({
	propStatus,
	dragOverrideValue,
	defaultValue,
	frame = null,
	shouldResortToDefaultValueIfUndefined = false,
}: {
	propStatus:
		| CanUpdateSequencePropStatusStatic
		| CanUpdateSequencePropStatusKeyframed;
	dragOverrideValue: DragOverrideValue | undefined;
	defaultValue: unknown;
	frame?: number | null;
	shouldResortToDefaultValueIfUndefined: boolean;
}) => {
	const dragOverride = resolveDragOverrideValue({
		dragOverrideValue,
	});
	if (dragOverride.type === 'resolved' && dragOverride.value !== undefined) {
		return dragOverride.value;
	}

	if (propStatus.status === 'keyframed') {
		if (frame !== null) {
			return interpolateKeyframedStatus({
				forceSpringAllowTail: null,
				frame,
				status: propStatus,
			});
		}

		return shouldResortToDefaultValueIfUndefined ? defaultValue : undefined;
	}

	if (
		propStatus.codeValue === undefined &&
		shouldResortToDefaultValueIfUndefined
	) {
		return defaultValue;
	}

	return propStatus.codeValue;
};
