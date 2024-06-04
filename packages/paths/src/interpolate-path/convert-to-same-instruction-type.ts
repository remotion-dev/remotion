import type {
	CInstruction,
	LInstruction,
	Point,
	ReducedInstruction,
} from '../helpers/types';

const convertToLCommand = (command: ReducedInstruction): LInstruction => {
	if (command.type === 'M' || command.type === 'L' || command.type === 'Z') {
		throw new Error('unexpected');
	}

	return {
		type: 'L',
		x: command.x,
		y: command.y,
	};
};

const convertToCCommand = (
	command: ReducedInstruction,
	currentPoint: Point,
): CInstruction => {
	if (command.type === 'M' || command.type === 'C' || command.type === 'Z') {
		throw new Error('unexpected');
	}

	if (command.type === 'L') {
		return {
			type: 'C',
			cp1x: currentPoint.x,
			cp1y: currentPoint.y,
			cp2x: command.x,
			cp2y: command.y,
			x: command.x,
			y: command.y,
		};
	}

	throw new Error('all types should be handled');
};

/**
 * Converts command A to have the same type as command B.
 *
 * e.g., L0,5 -> C0,5,0,5,0,5
 *
 * Uses these rules:
 * x1 <- x
 * x2 <- x
 * y1 <- y
 * y2 <- y
 * rx <- 0
 * ry <- 0
 * xAxisRotation <- read from B
 * largeArcFlag <- read from B
 * sweepflag <- read from B
 *
 * @param {Object} aCommand Command object from path `d` attribute
 * @param {Object} bCommand Command object from path `d` attribute to match against
 * @return {Object} aCommand converted to type of bCommand
 */
export function convertToSameInstructionType(
	aCommand: ReducedInstruction,
	bCommand: ReducedInstruction,
	currentPoint: Point,
): ReducedInstruction {
	if (aCommand.type === 'M' || bCommand.type === 'M') {
		return {...aCommand};
	}

	if (aCommand.type === bCommand.type) {
		return {...aCommand};
	}

	if (bCommand.type === 'C') {
		return convertToCCommand(aCommand, currentPoint);
	}

	if (bCommand.type === 'L') {
		return convertToLCommand(aCommand);
	}

	if (bCommand.type === 'Z') {
		return {
			type: 'Z',
		};
	}

	throw new TypeError('unhandled');
}
