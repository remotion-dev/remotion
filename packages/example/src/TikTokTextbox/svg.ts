import {Instruction, serializeInstructions} from '@remotion/paths';
import {CornerRounding} from './get-corner-roundings';

export const makeSvg = ({
	cornerRoundings,
	textAlign,
	horizontalPadding,
}: {
	cornerRoundings: CornerRounding[];
	textAlign: 'left' | 'center' | 'right';
	horizontalPadding: number;
}) => {
	const instructions: Instruction[] = [];

	let maxWidth = 0;
	for (const cornerRounding of cornerRoundings) {
		maxWidth = Math.max(maxWidth, cornerRounding.width + horizontalPadding * 2);
	}

	let yOffset = 0;

	for (let i = 0; i < cornerRoundings.length; i++) {
		const cornerRounding = cornerRoundings[i];
		let xOffset = 0;
		if (textAlign === 'center') {
			xOffset = (maxWidth - (cornerRounding.width + horizontalPadding * 2)) / 2;
		} else if (textAlign === 'right') {
			xOffset = maxWidth - (cornerRounding.width + horizontalPadding * 2);
		}

		if (i === 0) {
			instructions.push({
				type: 'M',
				x: xOffset,
				y: yOffset,
			});
		}
		instructions.push({
			type: 'L',
			x: xOffset + cornerRounding.width + horizontalPadding * 2,
			y: yOffset,
		});

		instructions.push({
			type: 'L',
			x: xOffset + cornerRounding.width + horizontalPadding * 2,
			y: yOffset + cornerRounding.height,
		});
		yOffset += cornerRounding.height;
	}
	for (let i = cornerRoundings.length - 1; i >= 0; i--) {
		const cornerRounding = cornerRoundings[i];
		let xOffset = 0;
		if (textAlign === 'center') {
			xOffset = (maxWidth - (cornerRounding.width + horizontalPadding * 2)) / 2;
		} else if (textAlign === 'right') {
			xOffset = maxWidth - (cornerRounding.width + horizontalPadding * 2);
		}

		instructions.push({
			type: 'L',
			x: xOffset,
			y: yOffset,
		});
		instructions.push({
			type: 'L',
			x: xOffset,
			y: yOffset - cornerRounding.height,
		});
		yOffset -= cornerRounding.height;
	}
	instructions.push({
		type: 'Z',
	});

	return serializeInstructions(instructions);
};
