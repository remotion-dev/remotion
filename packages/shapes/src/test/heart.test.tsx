import {expect, test} from 'bun:test';
import {Heart} from '../components/heart';
import {render} from './test-utils';

test('Should be able to make a heart svg', () => {
	const {container} = render(
		<Heart
			aspectRatio={1.1}
			height={100}
			bottomRoundnessAdjustment={0}
			depthAdjustment={0}
		/>,
	);

	expect(
		container
			.querySelector('path')
			?.getAttribute('d')
			?.startsWith('M 55.00000000000001 100 C 32.00000000000001'),
	).toBe(true);
});
