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
	frame,
}: {
	dragOverrideValue: DragOverrideValue | undefined;
	frame: number | null;
}): ResolvedDragOverrideValue => {
	if (dragOverrideValue === undefined) {
		return {type: 'none'};
	}

	if (dragOverrideValue.type === 'static') {
		return {type: 'resolved', value: dragOverrideValue.value};
	}

	if (frame === null) {
		return {type: 'none'};
	}

	const interpolated = interpolateKeyframedStatus({
		forceSpringAllowTail: null,
		frame,
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
		frame,
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
