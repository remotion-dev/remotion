import {expect, test} from 'bun:test';
import {Heart} from '../components/heart';
import {render} from './test-utils';

test('Should be able to make a heart svg', () => {
	const {container} = render(
		<Heart width={200} height={180} />,
	);

	expect(
		container
			.querySelector('path')
			?.getAttribute('d')
			?.startsWith('M '),
	).toBe(true);
});