import {expect, test} from 'bun:test';
import {getCompositionsMatchingSingleChild} from '../components/InspectorPanel/get-compositions-matching-single-child';

const Child = () => null;
const OtherChild = () => null;
const compositions = [
	{id: 'first', componentFromProps: Child},
	{id: 'second', componentFromProps: OtherChild},
	{id: 'third', componentFromProps: Child},
];

test('returns all compositions with the same component identity', () => {
	expect(
		getCompositionsMatchingSingleChild({
			compositions,
			singleChildComponent: Child,
		}).map((composition) => composition.id),
	).toEqual(['first', 'third']);
});

test('does not match when no single child component was detected', () => {
	expect(
		getCompositionsMatchingSingleChild({
			compositions,
			singleChildComponent: null,
		}),
	).toEqual([]);
});
