import {expect, test} from 'vitest';
import {Triangle} from '../components/triangle';
import {render} from './test-utils';

test('Should be able to make a triangle svg', () => {
	const {container} = render(
		<Triangle width={100} height={100} fill="red" direction="left" />
	);
	expect(
		container.querySelector('svg')?.getAttribute('data-shape-type')
	).toEqual('triangle');

	// assert path
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 100 0 L 100 100 L 0 50 z'
	);
});
