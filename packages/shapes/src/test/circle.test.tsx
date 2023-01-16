import {expect, test} from 'vitest';
import {Circle} from '../components/circle';
import {render} from './test-utils';

test('Should be able to make a circle svg', () => {
	const {container} = render(
		<Circle radius={100} fill="green" stroke="red" strokeWidth={1} />
	);

	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 100 100 m -100 0 a 100 100 0 1 0 200 0 100 100 0 1 0 -200 0'
	);
});
