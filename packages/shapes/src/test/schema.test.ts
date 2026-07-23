import {expect, test} from 'bun:test';
import {makeShapeSchema} from '../components/schema';

test('adds a fill control to shape schemas', () => {
	const schema = makeShapeSchema({});
	expect(schema.fill).toEqual({
		type: 'color',
		default: '#0b84ff',
		description: 'Fill',
	});
	expect('style.backgroundColor' in schema).toBe(true);
	expect('style.borderWidth' in schema).toBe(true);
	expect('style.borderStyle' in schema).toBe(true);
	expect('style.borderColor' in schema).toBe(true);
});
