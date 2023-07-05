import {Internals} from 'remotion';
import {expect, test} from 'vitest';

// TODO: move this to core library

test('date serialization', () => {
	const date = {data: new Date(), hi: 'there'};

	const {serializedString, customDateUsed, customFileUsed} =
		Internals.serializeJSONWithDate({
			data: date,
			indent: 2,
			staticBase: '/static',
		});
	expect(customDateUsed).toEqual(true);
	expect(customFileUsed).toEqual(false);

	const deserialized =
		Internals.deserializeJSONWithCustomFields(serializedString);

	expect(deserialized.data).toBeInstanceOf(Date);
});

test('No date used', () => {
	const {customDateUsed, customFileUsed, mapUsed} =
		Internals.serializeJSONWithDate({
			data: {a: 'hi'},
			indent: 2,
			staticBase: '/static',
		});
	expect(customDateUsed).toEqual(false);
	expect(customFileUsed).toEqual(false);
	expect(mapUsed).toEqual(false);
});

test('Map used', () => {
	const {mapUsed} = Internals.serializeJSONWithDate({
		data: {a: 'hi', map: new Map()},
		indent: 2,
		staticBase: '/static',
	});
	expect(mapUsed).toEqual(true);
});
