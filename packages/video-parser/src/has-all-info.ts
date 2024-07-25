import {hasDimensions} from './get-dimensions';
import {hasDuration} from './get-duration';
import type {Options} from './options';
import type {ParseResult} from './parse-result';

export const hasAllInfo = (
	options: Options<boolean, boolean, boolean>,
	parseResult: ParseResult,
) => {
	const keys = Object.entries(options)
		.filter(([, value]) => value)
		.map(([key]) => key) as (keyof Options<true, true, true>)[];

	return keys.every((key) => {
		if (key === 'boxes') {
			return parseResult.status === 'done';
		}

		if (key === 'durationInSeconds') {
			return hasDuration(parseResult.segments);
		}

		if (key === 'dimensions') {
			return hasDimensions(parseResult.segments);
		}

		throw new Error(`Unknown key: ${key satisfies never}`);
	});
};
