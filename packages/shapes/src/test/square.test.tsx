import {expect, test} from 'bun:test';
import {Rect} from '../components/rect';
import {render} from './test-utils';

test('Should be able to make a rect svg', () => {
	const {container} = render(<Rect width={200} height={200} fill="red" />);

	// assert path
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 0 0 L 200 0 L 200 200 L 0 200 L 0 0 Z',
	);
});
