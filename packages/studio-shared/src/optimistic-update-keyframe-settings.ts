import type {
	CanUpdateSequencePropsResponse,
	CanUpdateSequencePropStatus,
} from 'remotion';
import type {KeyframeSettings} from './api-requests';
import {LINEAR_KEYFRAME_EASING} from './keyframe-easing-presets';

type KeyframeEasing = Extract<
	CanUpdateSequencePropStatus,
	{status: 'keyframed'}
>['easing'][number];

const updateEasing = ({
	easing,
	segmentCount,
	segmentIndex,
	value,
}: {
	easing: KeyframeEasing[];
	segmentCount: number;
	segmentIndex: number;
	value: KeyframeEasing;
}): KeyframeEasing[] => {
	if (
		!Number.isInteger(segmentIndex) ||
		segmentIndex < 0 ||
		segmentIndex >= segmentCount
	) {
		throw new Error('Cannot update easing: segment index out of range');
	}

	const nextEasing = Array.from({length: segmentCount}, (_, index) => {
		return easing[index] ?? LINEAR_KEYFRAME_EASING;
	});
	nextEasing[segmentIndex] = value;
	return nextEasing;
};

const applySettingsToStatus = (
	status: CanUpdateSequencePropStatus | undefined,
	settings: KeyframeSettings,
): CanUpdateSequencePropStatus => {
	if (!status || status.status !== 'keyframed') {
		throw new Error('Expected keyframed status');
	}

	return {
		...status,
		...(settings.type === 'settings' && settings.clamping
			? {clamping: settings.clamping}
			: {}),
		...(settings.type === 'settings' ? {posterize: settings.posterize} : {}),
		...(settings.type === 'settings' ? {output: settings.output} : {}),
		...(settings.type === 'easing'
			? {
					easing: updateEasing({
						easing: status.easing,
						segmentCount: Math.max(0, status.keyframes.length - 1),
						segmentIndex: settings.segmentIndex,
						value: settings.easing,
					}),
				}
			: {}),
	};
};

export const optimisticUpdateSequenceKeyframeSettings = ({
	previous,
	fieldKey,
	settings,
}: {
	previous: CanUpdateSequencePropsResponse;
	fieldKey: string;
	settings: KeyframeSettings;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	const status = previous.props[fieldKey];
	if (!status || status.status !== 'keyframed') {
		return previous;
	}

	return {
		...previous,
		props: {
			...previous.props,
			[fieldKey]: applySettingsToStatus(status, settings),
		},
	};
};

export const optimisticUpdateEffectKeyframeSettings = ({
	previous,
	effectIndex,
	fieldKey,
	settings,
}: {
	previous: CanUpdateSequencePropsResponse;
	effectIndex: number;
	fieldKey: string;
	settings: KeyframeSettings;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	const targetIndex = previous.effects.findIndex(
		(effect) => effect.effectIndex === effectIndex,
	);
	if (targetIndex === -1) {
		return previous;
	}

	const target = previous.effects[targetIndex];
	if (!target.canUpdate) {
		return previous;
	}

	const status = target.props[fieldKey];
	if (!status || status.status !== 'keyframed') {
		return previous;
	}

	const effects = [...previous.effects];
	effects[targetIndex] = {
		...target,
		props: {
			...target.props,
			[fieldKey]: applySettingsToStatus(status, settings),
		},
	};

	return {
		...previous,
		effects,
	};
};
