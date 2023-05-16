import {expect, test} from 'vitest';
import {
	deserializeJSONWithCustomFields,
	serializeJSONWithDate,
} from '../editor/components/RenderModal/SchemaEditor/input-props-serialization';

test('date serialization', () => {
	const date = {data: new Date(), hi: 'there'};

	const {serializedString, customDateUsed} = serializeJSONWithDate({
		data: date,
		indent: 2,
		staticBase: '/static',
	});
	expect(customDateUsed).toEqual(true);

	const deserialized = deserializeJSONWithCustomFields(serializedString);

	expect(deserialized.data).toBeInstanceOf(Date);
});

test('No date used', () => {
	const {customDateUsed} = serializeJSONWithDate({
		data: {a: 'hi'},
		indent: 2,
		staticBase: '/static',
	});
	expect(customDateUsed).toEqual(false);
});
