import {expect, test} from 'bun:test';
import {Ellipse} from '../components/ellipse';
import {render} from './test-utils';

test('Should be able to make a circle svg', () => {
	const {container} = render(
		<Ellipse rx={100} ry={100} fill="green" stroke="red" strokeWidth={1} />,
	);

	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 100 0 a 100 100 0 1 0 1 0 Z',
	);
});
