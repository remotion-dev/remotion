import type {AllOptions, ParseMediaFields} from './fields';
import {fieldsNeedSamplesMap} from './state/need-samples-for-fields';

export const disallowForwardSeekIfSamplesAreNeeded = ({
	seekTo,
	previousPosition,
	fields,
}: {
	fields: Partial<AllOptions<ParseMediaFields>>;
	seekTo: number;
	previousPosition: number;
}) => {
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
			)}. Seek was from 0x${previousPosition.toString(16)} to 0x${seekTo.toString(
				16,
			)}. Either don't seek forward, or don't request these fields.`,
		);
	}
};
