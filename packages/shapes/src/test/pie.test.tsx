import {expect, test} from 'bun:test';
import {Pie} from '../components/pie';
import {render} from './test-utils';

test('Should be able to make a pie svg', () => {
	const {container} = render(<Pie progress={0.5} radius={100} />);

	// assert path
	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 100 0 A 100 100 0 0 1 100 200 L 100 100 Z',
	);
});
