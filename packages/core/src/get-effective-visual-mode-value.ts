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

export const getFrameInKeyframedStatusClock = ({
	frame,
	status,
}: {
	readonly frame: number;
	readonly status: CanUpdateSequencePropStatusKeyframed;
}) => frame - (status.keyframeDisplayOffsetAdjustment ?? 0);

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
		frame: getFrameInKeyframedStatusClock({
			frame,
			status: dragOverrideValue.status,
		}),
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
				frame: getFrameInKeyframedStatusClock({frame, status: propStatus}),
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
