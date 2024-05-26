import type {Command} from './command';
import {typeMap} from './command';

/**
 * Converts a command object to a string to be used in a `d` attribute
 * @param {Object} command A command object
 * @return {String} The string for the `d` attribute
 */
export function commandToString(command: Command) {
	return `${command.type} ${typeMap[command.type]
		.map((p) => command[p as keyof Command])
		.join(' ')}`;
}
