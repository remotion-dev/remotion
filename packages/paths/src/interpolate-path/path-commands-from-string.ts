import {typeMap, type Command} from './command';

const commandTokenRegex = /[MLCSTQAHVZmlcstqahv]|-?[\d.e+-]+/g;

/**
 * Takes a path `d` string and converts it into an array of command
 * objects. Drops the `Z` character.
 *
 * @param {String|null} d A path `d` string
 */
export function pathCommandsFromString(d: string | null) {
	// split into valid tokens
	const tokens = (d || '').match(commandTokenRegex) || [];
	const commands = [];
	let commandArgs: string[];
	let command: Command;

	// iterate over each token, checking if we are at a new command
	// by presence in the typeMap
	for (let i = 0; i < tokens.length; ++i) {
		commandArgs = typeMap[tokens[i] as keyof typeof typeMap];

		// new command found:
		if (commandArgs) {
			command = {
				type: tokens[i] as Command['type'],
			};

			// add each of the expected args for this command:
			for (let a = 0; a < commandArgs.length; ++a) {
				// @ts-expect-error
				command[commandArgs[a] as keyof Command] = Number(tokens[i + a + 1]);
			}

			// need to increment our token index appropriately since
			// we consumed token args
			i += commandArgs.length;

			commands.push(command);
		}
	}

	return commands;
}
