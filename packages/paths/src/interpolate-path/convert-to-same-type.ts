import type {Command} from './command';

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
export function convertToSameType(aCommand: Command, bCommand: Command) {
	const conversionMap = {
		x1: 'x',
		y1: 'y',
		x2: 'x',
		y2: 'y',
	} as const;

	const readFromBKeys = ['xAxisRotation', 'largeArcFlag', 'sweepFlag'];

	// convert (but ignore M types)
	if (aCommand.type !== bCommand.type && bCommand.type.toUpperCase() !== 'M') {
		const aConverted: Command = {
			type: bCommand.type,
		};
		Object.keys(bCommand).forEach((bKey) => {
			const bValue = bCommand[bKey as keyof Command];
			// first read from the A command
			let aValue = aCommand[bKey as keyof Command];

			// if it is one of these values, read from B no matter what
			if (aValue === undefined) {
				if (readFromBKeys.includes(bKey)) {
					aValue = bValue;
				} else {
					// if it wasn't in the A command, see if an equivalent was
					if (
						aValue === undefined &&
						conversionMap[bKey as keyof typeof conversionMap]
					) {
						aValue =
							aCommand[conversionMap[bKey as keyof typeof conversionMap]];
					}

					// if it doesn't have a converted value, use 0
					if (aValue === undefined) {
						aValue = 0;
					}
				}
			}

			// @ts-expect-error
			aConverted[bKey as keyof Command] = aValue;
		});

		// update the type to match B
		aConverted.type = bCommand.type;
		aCommand = aConverted;
	}

	return aCommand;
}
