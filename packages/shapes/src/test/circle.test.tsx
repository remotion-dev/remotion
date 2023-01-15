import {expect, test} from 'vitest';
import {Circle} from '../circle';
import {render} from './test-utils';

test('Should be able to make a circle svg', () => {
	const {container} = render(
		<Circle
			width={100}
			height={100}
			fill="green"
			stroke="red"
			strokeWidth={1}
		/>
	);
	// assert shape type
	expect(
		container.querySelector('svg')?.getAttribute('data-shape-type')
	).toEqual('ellipse');
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 50 50 m -50 0 a 50 50 0 1 0 100 0 50 50 0 1 0 -100 0'
	);
});
