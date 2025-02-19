import {makeCubic} from './bezier';
import {makeLinearPosition} from './linear';
import type {Point, Properties, ReducedInstruction} from './types';

type SegmentInstruction = {
	function: Properties | null;
	length: number;
	instruction: ReducedInstruction;
	startPoint: Point;
};

type Segment = {
	startPoint: Point;
	instructionsAndInfo: SegmentInstruction[];
};

export const conductAnalysis = (
	instructions: ReducedInstruction[],
): Segment[] => {
	let currentPoint: Point = {x: 0, y: 0};
	let moveStart: Point = {x: 0, y: 0};

	const segments: Segment[] = [];

	for (let i = 0; i < instructions.length; i++) {
		const instruction = instructions[i];

		// moveTo
		if (instruction.type === 'M') {
			currentPoint = {x: instruction.x, y: instruction.y};
			moveStart = {x: currentPoint.x, y: currentPoint.y};
			segments.push({
				startPoint: {x: instruction.x, y: instruction.y},
				instructionsAndInfo: [
					{
						instruction,
						function: null,
						length: 0,
						startPoint: currentPoint,
					},
				],
			});
		}

		if (instruction.type === 'L') {
			if (segments.length > 0) {
				const length = Math.sqrt(
					(currentPoint.x - instruction.x) ** 2 +
						(currentPoint.y - instruction.y) ** 2,
				);
				segments[segments.length - 1].instructionsAndInfo.push({
					instruction,
					length,
					function: makeLinearPosition({
						x0: currentPoint.x,
						x1: instruction.x,
						y0: currentPoint.y,
						y1: instruction.y,
					}),
					startPoint: currentPoint,
				});
			}

			currentPoint = {x: instruction.x, y: instruction.y};
		}

		if (instruction.type === 'Z') {
			if (segments.length > 0) {
				const length = Math.sqrt(
					(segments[segments.length - 1].startPoint.x - currentPoint.x) ** 2 +
						(segments[segments.length - 1].startPoint.y - currentPoint.y) ** 2,
				);
				segments[segments.length - 1].instructionsAndInfo.push({
					instruction,
					function: makeLinearPosition({
						x0: currentPoint.x,
						x1: moveStart.x,
						y0: currentPoint.y,
						y1: moveStart.y,
					}),
					length,
					startPoint: {...currentPoint},
				});
			}

			currentPoint = {x: moveStart.x, y: moveStart.y};
		}

		if (instruction.type === 'C') {
			const curve = makeCubic({
				startX: currentPoint.x,
				startY: currentPoint.y,
				cp1x: instruction.cp1x,
				cp1y: instruction.cp1y,
				cp2x: instruction.cp2x,
				cp2y: instruction.cp2y,
				x: instruction.x,
				y: instruction.y,
			});

			const length = curve.getTotalLength();
			if (segments.length > 0) {
				segments[segments.length - 1].instructionsAndInfo.push({
					instruction,
					length,
					function: curve,
					startPoint: {...currentPoint},
				});
			}

			currentPoint = {x: instruction.x, y: instruction.y};
		}
	}

	return segments;
};
