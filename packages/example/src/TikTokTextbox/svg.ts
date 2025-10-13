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
				x: xOffset + CORNER_RADIUS,
				y: yOffset,
			});
		}

		const topRightCornerRadius = clamp(
			prevCornerRounding
				? textAlign === 'right'
					? 0
					: textAlign === 'left'
						? (prevCornerRounding.width - cornerRounding.width) / 2
						: (prevCornerRounding.width - cornerRounding.width) / 4
				: -Infinity,
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

		const bottomRightCornerRadius = clamp(
			nextCornerRounding
				? textAlign === 'right'
					? 0
					: textAlign === 'left'
						? (nextCornerRounding.width - cornerRounding.width) / 2
						: (nextCornerRounding.width - cornerRounding.width) / 4
				: -Infinity,
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
		const prevCornerRounding = cornerRoundings[i + 1];
		const nextCornerRounding = cornerRoundings[i - 1];
		let xOffset = 0;
		if (textAlign === 'center') {
			xOffset = (maxWidth - (cornerRounding.width + horizontalPadding * 2)) / 2;
		} else if (textAlign === 'right') {
			xOffset = maxWidth - (cornerRounding.width + horizontalPadding * 2);
		}

		const bottomLeftWidthDifference = prevCornerRounding
			? prevCornerRounding.width - cornerRounding.width
			: -Infinity;

		const bottomLeftCornerRadius = clamp(
			prevCornerRounding
				? textAlign === 'left'
					? 0
					: textAlign === 'right'
						? bottomLeftWidthDifference / 2
						: bottomLeftWidthDifference / 4
				: -Infinity,
			-CORNER_RADIUS,
			CORNER_RADIUS,
		);

		// Bottom Left Corner
		if (bottomLeftCornerRadius !== 0) {
			instructions.push({
				type: 'L',
				x: xOffset - bottomLeftCornerRadius,
				y: yOffset,
			});
			// Arc for rounded corner (bottom left)
			instructions.push({
				type: 'A',
				rx: Math.abs(bottomLeftCornerRadius),
				ry: Math.abs(bottomLeftCornerRadius),
				xAxisRotation: 0,
				largeArcFlag: false,
				sweepFlag: bottomLeftCornerRadius < 0,
				x: xOffset,
				y: yOffset - Math.abs(bottomLeftCornerRadius),
			});
		} else {
			instructions.push({
				type: 'L',
				x: xOffset,
				y: yOffset,
			});
		}

		const topLeftWidthDifference = nextCornerRounding
			? nextCornerRounding.width - cornerRounding.width
			: -Infinity;
		const topLeftCornerRadius = clamp(
			nextCornerRounding
				? textAlign === 'left'
					? 0
					: textAlign === 'right'
						? topLeftWidthDifference / 2
						: topLeftWidthDifference / 4
				: -Infinity,
			-CORNER_RADIUS,
			CORNER_RADIUS,
		);

		// Top Left Corner
		if (topLeftCornerRadius !== 0) {
			instructions.push({
				type: 'L',
				x: xOffset,
				y: yOffset - cornerRounding.height + Math.abs(topLeftCornerRadius),
			});
			// Arc for rounded corner (top left)
			instructions.push({
				type: 'A',
				rx: Math.abs(topLeftCornerRadius),
				ry: Math.abs(topLeftCornerRadius),
				xAxisRotation: 0,
				largeArcFlag: false,
				sweepFlag: topLeftCornerRadius < 0,
				x: xOffset - topLeftCornerRadius,
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
