import type {AllOptions, ParseMediaFields} from './fields';
import {fieldsNeedSamplesMap} from './state/need-samples-for-fields';
import type {ParserState} from './state/parser-state';

export const disallowForwardSeekIfSamplesAreNeeded = (state: ParserState) => {
	const {fields} = state;

	const fieldsNeedingSamples = Object.entries(fields)
		.filter(([, value]) => value)
		.map(([key]) => key)
		.filter(
			(key) => fieldsNeedSamplesMap[key as keyof AllOptions<ParseMediaFields>],
		);

	if (fieldsNeedingSamples.length > 0) {
		throw new Error(
			`Forward seeking is not allowed when the following fields are requested from parseMedia(): ${fieldsNeedingSamples.join(
				', ',
			)}. Either don't seek forward, or don't request these fields.`,
		);
	}
};
