import {expect, test} from 'bun:test';
import {Star} from '../components/star';
import {render} from './test-utils';

test('Should be able to make a star svg', () => {
	const {container} = render(
		<Star innerRadius={200} outerRadius={150} points={5} />,
	);

	expect(
		container
			.querySelector('path')
			?.getAttribute('d')
			?.startsWith('M 190.2113032590307'),
	).toBe(true);
});
