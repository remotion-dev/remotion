import {Instruction, serializeInstructions} from '@remotion/paths';
import {CornerRounding} from './get-corner-roundings';

export const makeSvg = (
	cornerRoundings: CornerRounding[],
	textAlign: 'left' | 'center' | 'right',
) => {
	const instructions: Instruction[] = [];

	let maxWidth = 0;
	for (const cornerRounding of cornerRoundings) {
		maxWidth = Math.max(maxWidth, cornerRounding.width);
	}

	let yOffset = 0;

	for (const cornerRounding of cornerRoundings) {
		let xOffset = 0;
		if (textAlign === 'center') {
			xOffset = (maxWidth - cornerRounding.width) / 2;
		} else if (textAlign === 'right') {
			xOffset = maxWidth - cornerRounding.width;
		}
		instructions.push({
			type: 'M',
			x: xOffset,
			y: yOffset,
		});
		instructions.push({
			type: 'L',
			x: xOffset + cornerRounding.width,
			y: yOffset,
		});
		instructions.push({
			type: 'L',
			x: xOffset + cornerRounding.width,
			y: yOffset + cornerRounding.height,
		});
		instructions.push({
			type: 'L',
			x: xOffset,
			y: yOffset + cornerRounding.height,
		});
		instructions.push({
			type: 'L',
			x: xOffset,
			y: yOffset,
		});
		yOffset += cornerRounding.height;
	}

	return serializeInstructions(instructions);
};
