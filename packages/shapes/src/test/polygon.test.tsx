import {expect, test} from 'bun:test';
import {Polygon} from '../components/polygon';
import {render} from './test-utils';

test('Should be able to make a triangle', () => {
	const {container} = render(<Polygon radius={100} points={3} />);
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 100 0 L 186.60254037844388 150 L 13.397459621556152 150.00000000000003 L 100 0',
	);
});

test('Should be able to make a pentagon', () => {
	const {container} = render(<Polygon radius={100} points={5} />);
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 100 0 L 195.10565162951536 69.09830056250526 L 158.77852522924732 180.90169943749476 L 41.2214747707527 180.90169943749476 L 4.894348370484636 69.09830056250527 L 100 0',
	);
});

test('Should be able to make a hexagon', () => {
	const {container} = render(<Polygon radius={100} points={6} />);
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 100 0 L 186.60254037844385 50 L 186.60254037844388 150 L 100 200 L 13.397459621556152 150.00000000000003 L 13.397459621556095 50.000000000000064 L 100 0',
	);
});

test('Create malformed Polygon, should fail', () => {
	try {
		render(<Polygon radius={100} points={2} />);
	} catch (error) {
		expect(error).toEqual(new Error(`"points" should be minimum 3, got 2`));
	}
});
