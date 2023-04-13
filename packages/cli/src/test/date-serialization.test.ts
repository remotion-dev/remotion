import {expect, test} from 'vitest';
import {
	deserializeJSONWithDate,
	serializeJSONWithDate,
} from '../editor/components/RenderModal/SchemaEditor/date-serialization';

test('date serialization', () => {
	const date = {data: new Date(), hi: 'there'};

	const chat = serializeJSONWithDate(date, 2);
	const deserialized = deserializeJSONWithDate(chat);

	expect(deserialized.data).toBeInstanceOf(Date);
});
