import {expect, test} from 'bun:test';
import {
	deserializeJSONWithSpecialTypes,
	serializeJSONWithSpecialTypes,
} from '../input-props-serialization.js';

test('date serialization', () => {
	const date = {data: new Date(), hi: 'there'};

	const {serializedString, customDateUsed, customFileUsed} =
		serializeJSONWithSpecialTypes({
			data: date,
			indent: 2,
			staticBase: '/static',
		});
	expect(customDateUsed).toEqual(true);
	expect(customFileUsed).toEqual(false);

	const deserialized = deserializeJSONWithSpecialTypes(serializedString);

	expect(deserialized.data).toBeInstanceOf(Date);
});

test('No date used', () => {
	const {customDateUsed, customFileUsed, mapUsed} =
		serializeJSONWithSpecialTypes({
			data: {a: 'hi'},
			indent: 2,
			staticBase: '/static',
		});
	expect(customDateUsed).toEqual(false);
	expect(customFileUsed).toEqual(false);
	expect(mapUsed).toEqual(false);
});

test('Map used', () => {
	const {mapUsed} = serializeJSONWithSpecialTypes({
		data: {a: 'hi', map: new Map()},
		indent: 2,
		staticBase: '/static',
	});
	expect(mapUsed).toEqual(true);
});
