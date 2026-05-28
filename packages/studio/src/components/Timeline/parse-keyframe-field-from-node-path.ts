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
	if (auxiliaryKeys[0] === 'controls' && auxiliaryKeys.length >= 2) {
		return {
			type: 'sequence',
			fieldKey: auxiliaryKeys[1],
		};
	}

	if (
		auxiliaryKeys[0] === 'effects' &&
		auxiliaryKeys.length >= 3 &&
		auxiliaryKeys[1] !== undefined &&
		auxiliaryKeys[2] !== undefined
	) {
		return {
			type: 'effect',
			effectIndex: Number(auxiliaryKeys[1]),
			fieldKey: auxiliaryKeys[2],
		};
	}

	return null;
};
