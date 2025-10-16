import type {Dimensions} from '@remotion/layout-utils';
import type {
	BoundingBox,
	Instruction,
	ReducedInstruction,
} from '@remotion/paths';
import {
	PathInternals,
	reduceInstructions,
	serializeInstructions,
} from '@remotion/paths';

const clamp = (val: number, min: number, max: number) => {
	return Math.min(Math.max(val, min), max);
};

export type TextAlign = 'left' | 'center' | 'right';

export type CreateRoundedTextBoxProps = {
	textMeasurements: Dimensions[];
	textAlign: TextAlign;
	horizontalPadding: number;
	borderRadius: number;
};

export type CreateRoundedTextBoxResult = {
	d: string;
	boundingBox: BoundingBox;
	instructions: ReducedInstruction[];
};

export const createRoundedTextBox = ({
	textMeasurements,
	textAlign,
	horizontalPadding,
	borderRadius: unclampedMaxCornerRadius,
}: CreateRoundedTextBoxProps) => {
	const instructions: Instruction[] = [];

	let maxWidth = 0;
	for (const cornerRounding of textMeasurements) {
		maxWidth = Math.max(maxWidth, cornerRounding.width + horizontalPadding * 2);
	}

	let yOffset = 0;

	for (let i = 0; i < textMeasurements.length; i++) {
		const previousLine = textMeasurements[i - 1];
		const currentLine = textMeasurements[i];
		const nextLine = textMeasurements[i + 1];
		let xOffset = 0;
		if (textAlign === 'center') {
			xOffset = (maxWidth - (currentLine.width + horizontalPadding * 2)) / 2;
		} else if (textAlign === 'right') {
			xOffset = maxWidth - (currentLine.width + horizontalPadding * 2);
		}

		const maxCornerRadius = clamp(
			unclampedMaxCornerRadius,
			0,
			currentLine.height / 2,
		);

		if (i === 0) {
			instructions.push({
				type: 'M',
				x: xOffset + maxCornerRadius,
				y: yOffset,
			});
		}

		const topRightCornerRadius = clamp(
			previousLine
				? textAlign === 'right'
					? 0
					: textAlign === 'left'
						? (previousLine.width - currentLine.width) / 2
						: (previousLine.width - currentLine.width) / 4
				: -Infinity,
			-maxCornerRadius,
			maxCornerRadius,
		);
		// Top Right Corner
		if (topRightCornerRadius !== 0) {
			instructions.push({
				type: 'L',
				x:
					xOffset +
					currentLine.width +
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
				x: xOffset + currentLine.width + horizontalPadding * 2,
				y: yOffset + Math.abs(topRightCornerRadius),
			});
		} else {
			instructions.push({
				type: 'L',
				x: xOffset + currentLine.width + horizontalPadding * 2,
				y: yOffset,
			});
		}

		const bottomRightCornerRadius = clamp(
			nextLine
				? textAlign === 'right'
					? 0
					: textAlign === 'left'
						? (nextLine.width - currentLine.width) / 2
						: (nextLine.width - currentLine.width) / 4
				: -Infinity,
			-maxCornerRadius,
			maxCornerRadius,
		);

		// Bottom Right Corner
		if (bottomRightCornerRadius !== 0) {
			instructions.push({
				type: 'L',
				x: xOffset + currentLine.width + horizontalPadding * 2,
				y: yOffset + currentLine.height - Math.abs(bottomRightCornerRadius),
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
					currentLine.width +
					horizontalPadding * 2 +
					bottomRightCornerRadius,
				y: yOffset + currentLine.height,
			});
		} else {
			instructions.push({
				type: 'L',
				x: xOffset + currentLine.width + horizontalPadding * 2,
				y: yOffset + currentLine.height,
			});
		}

		yOffset += currentLine.height;
	}

	for (let i = textMeasurements.length - 1; i >= 0; i--) {
		const cornerRounding = textMeasurements[i];
		const prevCornerRounding = textMeasurements[i + 1];
		const nextCornerRounding = textMeasurements[i - 1];
		let xOffset = 0;
		if (textAlign === 'center') {
			xOffset = (maxWidth - (cornerRounding.width + horizontalPadding * 2)) / 2;
		} else if (textAlign === 'right') {
			xOffset = maxWidth - (cornerRounding.width + horizontalPadding * 2);
		}

		const bottomLeftWidthDifference = prevCornerRounding
			? prevCornerRounding.width - cornerRounding.width
			: -Infinity;

		const maxCornerRadius = clamp(
			unclampedMaxCornerRadius,
			0,
			cornerRounding.height / 2,
		);

		const bottomLeftCornerRadius = clamp(
			prevCornerRounding
				? textAlign === 'left'
					? 0
					: textAlign === 'right'
						? bottomLeftWidthDifference / 2
						: bottomLeftWidthDifference / 4
				: -Infinity,
			-maxCornerRadius,
			maxCornerRadius,
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
			-maxCornerRadius,
			maxCornerRadius,
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

	const reduced = reduceInstructions(instructions);

	const boundingBox = PathInternals.getBoundingBoxFromInstructions(reduced);

	return {
		d: serializeInstructions(reduced),
		boundingBox,
		instructions: reduced,
	};
};
