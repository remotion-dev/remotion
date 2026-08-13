import {emitAvailableInfo} from './emit-available-info';
import type {Options, ParseMediaFields} from './fields';
import {getAvailableInfo} from './has-all-info';
import type {ParserState} from './state/parser-state';

export const emitAllInfo = async (state: ParserState) => {
	// Force assign
	const allFields: Record<keyof Options<ParseMediaFields>, boolean> =
		{} as Record<keyof Options<ParseMediaFields>, boolean>;

	const keys = Object.keys(state.fields) as (keyof Options<ParseMediaFields>)[];
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (state.fields[key]) {
			allFields[key] = true;
		}
	}

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
