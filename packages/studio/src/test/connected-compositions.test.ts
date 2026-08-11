import {expect, test} from 'bun:test';
import {getConnectedCompositions} from '../helpers/get-connected-compositions';

const Child = () => null;
const OtherChild = () => null;
const compositions = [
	{id: 'first', componentFromProps: Child},
	{id: 'second', componentFromProps: OtherChild},
	{id: 'third', componentFromProps: Child},
];

test('returns all connected compositions', () => {
	expect(
		getConnectedCompositions({
			compositions,
			singleChildComponent: Child,
		}).map((composition) => composition.id),
	).toEqual(['first', 'third']);
});

test('does not connect compositions without a single child component', () => {
	expect(
		getConnectedCompositions({
			compositions,
			singleChildComponent: null,
		}),
	).toEqual([]);
});
