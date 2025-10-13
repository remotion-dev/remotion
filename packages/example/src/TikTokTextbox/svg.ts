import {Instruction, serializeInstructions} from '@remotion/paths';
import {CornerRounding} from './get-corner-roundings';

const CORNER_RADIUS = 10;

const clamp = (val: number, min: number, max: number) => {
	return Math.min(Math.max(val, min), max);
};

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
		const prevCornerRounding = cornerRoundings[i - 1];
		const cornerRounding = cornerRoundings[i];
		const nextCornerRounding = cornerRoundings[i + 1];
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

		const topRightWidthDifference = prevCornerRounding
			? prevCornerRounding.width - cornerRounding.width
			: -Infinity;
		const topRightCornerRadius = clamp(
			topRightWidthDifference / 4,
			-CORNER_RADIUS,
			CORNER_RADIUS,
		);
		// Top Right Corner
		if (topRightCornerRadius !== 0) {
			instructions.push({
				type: 'L',
				x:
					xOffset +
					cornerRounding.width +
					horizontalPadding * 2 +
					topRightCornerRadius,
				y: yOffset,
			});
			// Arc for rounded corner (top right)
			instructions.push({
				type: 'A',
				rx: Math.abs(topRightCornerRadius),
				ry: Math.abs(topRightCornerRadius),
				xAxisRotation: 0,
				largeArcFlag: false,
				sweepFlag: topRightCornerRadius < 0,
				x: xOffset + cornerRounding.width + horizontalPadding * 2,
				y: yOffset + Math.abs(topRightCornerRadius),
			});
		} else {
			instructions.push({
				type: 'L',
				x: xOffset + cornerRounding.width + horizontalPadding * 2,
				y: yOffset,
			});
		}

		const bottomRightWidthDifference = nextCornerRounding
			? nextCornerRounding.width - cornerRounding.width
			: -Infinity;
		const bottomRightCornerRadius = clamp(
			bottomRightWidthDifference / 4,
			-CORNER_RADIUS,
			CORNER_RADIUS,
		);

		// Bottom Right Corner
		if (bottomRightCornerRadius !== 0) {
			instructions.push({
				type: 'L',
				x: xOffset + cornerRounding.width + horizontalPadding * 2,
				y: yOffset + cornerRounding.height - Math.abs(bottomRightCornerRadius),
			});
			// Arc for rounded corner (bottom right)
			instructions.push({
				type: 'A',
				rx: Math.abs(bottomRightCornerRadius),
				ry: Math.abs(bottomRightCornerRadius),
				xAxisRotation: 0,
				largeArcFlag: false,
				sweepFlag: bottomRightCornerRadius < 0,
				x:
					xOffset +
					cornerRounding.width +
					horizontalPadding * 2 +
					bottomRightCornerRadius,
				y: yOffset + cornerRounding.height,
			});
		} else {
			instructions.push({
				type: 'L',
				x: xOffset + cornerRounding.width + horizontalPadding * 2,
				y: yOffset + cornerRounding.height,
			});
		}
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

		const bottomLeft = i === cornerRoundings.length - 1;
		const topLeft = i === 0;
		// Bottom Left Corner
		if (bottomLeft) {
			instructions.push({
				type: 'L',
				x: xOffset + CORNER_RADIUS,
				y: yOffset,
			});
			// Arc for rounded corner (bottom left)
			instructions.push({
				type: 'A',
				rx: CORNER_RADIUS,
				ry: CORNER_RADIUS,
				xAxisRotation: 0,
				largeArcFlag: false,
				sweepFlag: true,
				x: xOffset,
				y: yOffset - CORNER_RADIUS,
			});
		} else {
			instructions.push({
				type: 'L',
				x: xOffset,
				y: yOffset,
			});
		}

		// Top Left Corner
		if (topLeft) {
			instructions.push({
				type: 'L',
				x: xOffset,
				y: yOffset - cornerRounding.height + CORNER_RADIUS,
			});
			// Arc for rounded corner (top left)
			instructions.push({
				type: 'A',
				rx: CORNER_RADIUS,
				ry: CORNER_RADIUS,
				xAxisRotation: 0,
				largeArcFlag: false,
				sweepFlag: true,
				x: xOffset + CORNER_RADIUS,
				y: yOffset - cornerRounding.height,
			});
		} else {
			instructions.push({
				type: 'L',
				x: xOffset,
				y: yOffset - cornerRounding.height,
			});
		}

		yOffset -= cornerRounding.height;
	}
	instructions.push({
		type: 'Z',
	});

	return serializeInstructions(instructions);
};
