import type {
	CanUpdateSequencePropsResponse,
	CanUpdateSequencePropStatus,
} from 'remotion';
import type {KeyframeSettings} from './api-requests';

const applySettingsToStatus = (
	status: CanUpdateSequencePropStatus | undefined,
	settings: KeyframeSettings,
): CanUpdateSequencePropStatus => {
	if (!status || status.status !== 'keyframed') {
		throw new Error('Expected keyframed status');
	}

	return {
		...status,
		...(settings.clamping ? {clamping: settings.clamping} : {}),
		posterize: settings.posterize,
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
