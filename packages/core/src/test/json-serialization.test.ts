import {expect, test} from 'bun:test';
import {
	deserializeJSONWithCustomFields,
	serializeJSONWithDate,
} from '../input-props-serialization.js';

test('date serialization', () => {
	const date = {data: new Date(), hi: 'there'};

	const {serializedString, customDateUsed, customFileUsed} =
		serializeJSONWithDate({
			data: date,
			indent: 2,
			staticBase: '/static',
		});
	expect(customDateUsed).toEqual(true);
	expect(customFileUsed).toEqual(false);

	const deserialized = deserializeJSONWithCustomFields(serializedString);

	expect(deserialized.data).toBeInstanceOf(Date);
});

test('No date used', () => {
	const {customDateUsed, customFileUsed, mapUsed} = serializeJSONWithDate({
		data: {a: 'hi'},
		indent: 2,
		staticBase: '/static',
	});
	expect(customDateUsed).toEqual(false);
	expect(customFileUsed).toEqual(false);
	expect(mapUsed).toEqual(false);
});

test('Map used', () => {
	const {mapUsed} = serializeJSONWithDate({
		data: {a: 'hi', map: new Map()},
		indent: 2,
		staticBase: '/static',
	});
	expect(mapUsed).toEqual(true);
});
