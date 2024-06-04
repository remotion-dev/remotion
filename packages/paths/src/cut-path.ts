import {constructFromInstructions} from './helpers/construct';
import {parsePath} from './parse-path';

export const cutPath = (d: string, length: number) => {
	const parsed = parsePath(d);

	const constructed = constructFromInstructions(parsed);
};
