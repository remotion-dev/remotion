import {expect, test} from 'bun:test';
import {Triangle} from '../components/triangle';
import {render} from './test-utils';

test('Should be able to make a triangle svg', () => {
	const {container} = render(
		<Triangle length={100} fill="red" direction="left" />,
	);

	// assert path
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 86.60254037844386 0 L 86.60254037844386 100 L 0 50 L 86.60254037844386 0 Z',
	);
});
