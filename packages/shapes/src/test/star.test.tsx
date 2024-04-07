import {expect, test} from 'bun:test';
import {Star} from '../components/star';
import {render} from './test-utils';

test('Should be able to make a star svg', () => {
	const {container} = render(
		<Star innerRadius={200} outerRadius={150} points={5} />,
	);

	expect(container.querySelector('path')?.getAttribute('d')).toStartWith(
		'M 190.2113032590307 11.803398874989483 L 307.7683537175253 0 L 332.8697807033037 115.45084971874738',
	);
});
