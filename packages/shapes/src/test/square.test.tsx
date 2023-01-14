import {expect, test} from 'vitest';
import {Square} from '../square';
import {render} from './test-utils';

test('Should be able to make a square svg', () => {
	const {container} = render(
		<Square width={200} height={200} size={100} fill="red" />
	);
	// assert shape type
	expect(
		container.querySelector('svg')?.getAttribute('data-shape-type')
	).toEqual('square');

	// assert path
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 50, 50 l 100, 0 l 0, 100 l -100, 0 Z'
	);
});
