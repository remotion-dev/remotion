import {expect, test} from 'bun:test';
import {Callout} from '../components/callout';
import {render} from './test-utils';

test('Should be able to make a callout svg', () => {
	const {container} = render(
		<Callout
			width={300}
			height={120}
			pointerLength={40}
			pointerBaseWidth={60}
			fill="red"
		/>,
	);

	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 0 0 L 300 0 L 300 120 L 180 120 L 150 160 L 120 120 L 0 120 L 0 0 Z',
	);
});
