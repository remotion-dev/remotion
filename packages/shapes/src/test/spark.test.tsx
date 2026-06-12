import {expect, test} from 'bun:test';
import {Spark} from '../components/spark';
import {render} from './test-utils';

test('Should be able to make a spark svg', () => {
	const {container} = render(<Spark innerRadius={50} outerRadius={200} />);

	expect(
		container
			.querySelector('path')
			?.getAttribute('d')
			?.startsWith('M 200 0 L 235.35533905932738'),
	).toBe(true);
});
