import {expect, test} from 'bun:test';
import {makeShapeSchema} from '../components/schema';

test('adds a fill control to shape schemas', () => {
	expect(makeShapeSchema({}).fill).toEqual({
		type: 'color',
		default: '#0b84ff',
		description: 'Fill',
	});
});
