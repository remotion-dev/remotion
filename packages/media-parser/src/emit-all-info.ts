import {emitAvailableInfo} from './emit-available-info';
import type {Options, ParseMediaFields} from './fields';
import {getAvailableInfo} from './has-all-info';
import type {ParserState} from './state/parser-state';

export const emitAllInfo = async (state: ParserState) => {
	// Force assign
	const allFields = (
		Object.keys(state.fields) as (keyof Options<ParseMediaFields>)[]
	).reduce(
		(acc, key) => {
			if (state.fields?.[key]) {
				acc[key] = true;
			}

			return acc;
		},
		{} as Record<keyof Options<ParseMediaFields>, boolean>,
	);

	await emitAvailableInfo({
		hasInfo: allFields,
		state,
	});
};

export const triggerInfoEmit = async (state: ParserState) => {
	const availableInfo = getAvailableInfo({
		state,
	});
	await emitAvailableInfo({
		hasInfo: availableInfo,
		state,
	});
};
