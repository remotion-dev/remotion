export const parseKeyframeFieldFromNodePath = (
	auxiliaryKeys: string[],
):
	| {
			readonly type: 'sequence';
			readonly fieldKey: string;
	  }
	| {
			readonly type: 'effect';
			readonly effectIndex: number;
			readonly fieldKey: string;
	  }
	| null => {
	// Sequence control field: ['controls', fieldKey]
	if (auxiliaryKeys[0] === 'controls' && auxiliaryKeys.length >= 2) {
		return {
			type: 'sequence',
			fieldKey: auxiliaryKeys.slice(1).join('.'),
		};
	}

	// Effect field: ['effects', effectIndex, fieldKey]
	if (auxiliaryKeys[0] === 'effects' && auxiliaryKeys.length >= 3) {
		const effectIndex = Number(auxiliaryKeys[1]);
		if (!Number.isInteger(effectIndex) || effectIndex < 0) {
			return null;
		}

		return {
			type: 'effect',
			effectIndex,
			fieldKey: auxiliaryKeys.slice(2).join('.'),
		};
	}

	return null;
};
