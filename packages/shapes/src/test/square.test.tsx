import {expect, test} from 'vitest';
import {Square} from '../square';
import {render} from './test-utils';

test('Should be able to make a square svg', () => {
	const {container} = render(<Square width={200} height={200} fill="red" />);
	// assert shape type
	expect(
		container.querySelector('svg')?.getAttribute('data-shape-type')
	).toEqual('square');

	// assert path
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 0 0 l 200 0 l 0 200 l -200 0 Z'
	);
});
