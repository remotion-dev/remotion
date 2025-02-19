import {expect, test} from 'bun:test';
import {Polygon} from '../components/polygon';
import {render} from './test-utils';

test('Should be able to make a triangle', () => {
	const {container} = render(<Polygon radius={100} points={3} />);
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 86.60254037844385 0 L 173.20508075688772 150 L 0 150.00000000000003 L 86.60254037844385 0',
	);
});

test('Should be able to make a pentagon', () => {
	const {container} = render(<Polygon radius={100} points={5} />);
	expect(
		container
			.querySelector('path')
			?.getAttribute('d')
			?.startsWith(
				'M 95.10565162951536 0 L 190.21130325903073 69.09830056250526 L 153.8841768587627',
			),
	).toBeTruthy();
});

test('Should be able to make a hexagon', () => {
	const {container} = render(<Polygon radius={100} points={6} />);
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 86.6025403784439 0 L 173.20508075688775 50 L 173.20508075688778 150 L 86.6025403784439 200 L 5.684341886080802e-14 150.00000000000003 L 0 50.000000000000064 L 86.6025403784439 0',
	);
});

test('Create malformed Polygon, should fail', () => {
	try {
		render(<Polygon radius={100} points={2} />);
	} catch (error) {
		expect(error).toEqual(new Error(`"points" should be minimum 3, got 2`));
	}
});
