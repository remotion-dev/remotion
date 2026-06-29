import {
	Instruction,
	parsePath,
	serializeInstructions,
	translatePath,
} from '@remotion/paths';
import {interpolate} from 'remotion';
import {turnInto3D} from '../fix-z';
import {subdivide2DCInstruction} from '../subdivide-instruction';
import {truthy} from '../truthy';

export const makeRoundedProgress = ({
	outerCornerRadius,
	padding,
	boxWidth,
	height,
	width,
	evolve,
	boxHeight,
}: {
	outerCornerRadius: number;
	padding: number;
	boxWidth: number;
	boxHeight: number;
	width: number;
	height: number;
	evolve: number;
}) => {
	const innerCornerRadius = outerCornerRadius - padding;
	const cornerRadiusFactor = (4 / 3) * Math.tan(Math.PI / 8);

	const actualWidth = boxWidth * evolve;

	const startOfEndCurve = boxWidth - innerCornerRadius;
	const lerpStartCurve = interpolate(
		actualWidth,
		[0, innerCornerRadius],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	const lerpEndCurve = interpolate(
		evolve,
		[startOfEndCurve / boxWidth, 1],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	const start: Instruction = {
		type: 'M',
		x: 0,
		y: innerCornerRadius,
	};

	const [topLeftCorner] = subdivide2DCInstruction(
		start.x,
		start.y,
		{
			type: 'C' as const,
			x: innerCornerRadius,
			y: 0,
			cp1x: 0,
			cp1y: innerCornerRadius - innerCornerRadius * cornerRadiusFactor,
			cp2x: innerCornerRadius - innerCornerRadius * cornerRadiusFactor,
			cp2y: 0,
		},
		lerpStartCurve
	);

	if (topLeftCorner.type !== 'C') {
		throw new Error('Expected C');
	}

	const toRight: Instruction = {
		type: 'L',
		x: Math.max(topLeftCorner.x, Math.min(actualWidth, startOfEndCurve)),
		y: topLeftCorner.y,
	};

	const [topRightCorner] = subdivide2DCInstruction(
		boxWidth - innerCornerRadius,
		0,
		{
			type: 'C',
			x: boxWidth,
			y: innerCornerRadius,
			cp1x:
				boxWidth - innerCornerRadius + innerCornerRadius * cornerRadiusFactor,
			cp1y: 0,
			cp2x: boxWidth,
			cp2y: innerCornerRadius - innerCornerRadius * cornerRadiusFactor,
		},
		lerpEndCurve
	);

	const [hiddenBottomRightCorner, bottomRightCorner] = subdivide2DCInstruction(
		boxWidth,
		boxHeight - innerCornerRadius,
		{
			type: 'C',
			x: boxWidth - innerCornerRadius,
			y: boxHeight,
			cp1x: boxWidth,
			cp1y:
				boxHeight - innerCornerRadius + innerCornerRadius * cornerRadiusFactor,
			cp2x:
				boxWidth - innerCornerRadius + innerCornerRadius * cornerRadiusFactor,
			cp2y: boxHeight,
		},
		1 - lerpEndCurve
	);

	if (hiddenBottomRightCorner.type !== 'C') {
		throw new Error('Expected C');
	}

	const toLeft: Instruction = {
		type: 'L' as const,
		x: Math.min(actualWidth, innerCornerRadius),
		y: boxHeight,
	};

	const [hiddenBottomLeftCorner, bottomLeftCorner] = subdivide2DCInstruction(
		innerCornerRadius,
		boxHeight,
		{
			type: 'C',
			x: 0,
			y: boxHeight - innerCornerRadius,
			cp1x: innerCornerRadius - innerCornerRadius * cornerRadiusFactor,
			cp1y: boxHeight,
			cp2x: 0,
			cp2y:
				boxHeight - innerCornerRadius + innerCornerRadius * cornerRadiusFactor,
		},
		1 - lerpStartCurve
	);

	if (hiddenBottomLeftCorner.type !== 'C') {
		throw new Error('Expected C');
	}

	const toBottom: Instruction =
		lerpEndCurve > 0
			? {
					type: 'L',
					x: hiddenBottomRightCorner.x,
					y: hiddenBottomRightCorner.y,
			  }
			: lerpStartCurve < 1
			? {
					type: 'L',
					x: hiddenBottomLeftCorner.x,
					y: hiddenBottomLeftCorner.y,
			  }
			: {
					type: 'L',
					x: actualWidth,
					y: boxHeight,
			  };

	const paths: Instruction[] = [
		start,
		topLeftCorner,
		lerpStartCurve === 1 ? toRight : null,
		lerpEndCurve > 0 ? topRightCorner : null,
		toBottom,
		lerpEndCurve > 0 ? bottomRightCorner : null,
		lerpStartCurve === 1 ? toLeft : null,
		bottomLeftCorner,
		{
			type: 'L' as const,
			x: 0,
			y: innerCornerRadius,
		},
	].filter(truthy);

	return turnInto3D(
		parsePath(
			translatePath(
				serializeInstructions(paths),
				-width / 2 + 1,
				-height / 2 + 1
			)
		)
	);
};
