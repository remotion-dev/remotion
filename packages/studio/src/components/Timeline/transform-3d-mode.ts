import type {CanUpdateSequencePropStatus} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {parseCssRotationToEuler} from './timeline-rotation-utils';
import {parseTranslate} from './timeline-translate-utils';
import {
	parseTransformOrigin,
	parseTransformOriginZ,
} from './transform-origin-utils';

const has3DTransformValue = ({
	fieldKey,
	value,
}: {
	readonly fieldKey: string;
	readonly value: unknown;
}): boolean => {
	if (fieldKey === 'style.scale') {
		return NoReactInternals.parseScaleValue(value)[2] !== 1;
	}

	if (fieldKey === 'style.rotate') {
		const rotation = parseCssRotationToEuler(String(value ?? '0deg'));
		return rotation[0] !== 0 || rotation[1] !== 0;
	}

	if (fieldKey === 'style.translate') {
		const z = parseTranslate(String(value ?? '0px 0px'))[2];
		return z !== null && z !== 0;
	}

	if (fieldKey === 'style.transformOrigin') {
		const parsed = parseTransformOrigin(value);
		const z = parsed?.z ? parseTransformOriginZ(parsed.z) : null;
		return z !== null && z.value !== 0;
	}

	return false;
};

export const propStatusHas3DTransformValue = ({
	fieldKey,
	propStatus,
	runtimeValue,
}: {
	readonly fieldKey: string;
	readonly propStatus: CanUpdateSequencePropStatus | undefined;
	readonly runtimeValue: unknown;
}): boolean => {
	if (propStatus?.status === 'keyframed') {
		return propStatus.keyframes.some((keyframe) =>
			has3DTransformValue({fieldKey, value: keyframe.value}),
		);
	}

	return has3DTransformValue({
		fieldKey,
		value:
			propStatus?.status === 'static' ? propStatus.codeValue : runtimeValue,
	});
};
