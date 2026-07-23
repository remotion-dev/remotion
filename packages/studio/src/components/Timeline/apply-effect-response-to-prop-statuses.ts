import type {
	CanUpdateEffectPropsResponse,
	CanUpdateSequencePropsResponse,
} from 'remotion';

export const applyEffectResponseToPropStatuses = ({
	previous,
	response,
}: {
	previous: CanUpdateSequencePropsResponse;
	response: CanUpdateEffectPropsResponse;
}): CanUpdateSequencePropsResponse => {
	if (!previous.canUpdate) {
		return previous;
	}

	const targetIndex = previous.effects.findIndex(
		(effect) => effect.effectIndex === response.effectIndex,
	);
	if (targetIndex === -1) {
		return previous;
	}

	const effects = [...previous.effects];
	effects[targetIndex] = response;

	return {
		...previous,
		effects,
	};
};
