import {expect, test} from 'bun:test';
import {Heart} from '../components/heart';
import {render} from './test-utils';

test('Should be able to make a heart svg', () => {
	const {container} = render(<Heart width={100} height={100} />);

	expect(
		container.querySelector('path')?.getAttribute('d')?.startsWith('M 50 85 C'),
	).toBe(true);
});
