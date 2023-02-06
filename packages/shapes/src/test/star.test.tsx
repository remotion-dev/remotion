import {expect, test} from 'vitest';
import {Star} from '../components/star';
import {render} from './test-utils';

test('Should be able to make a star svg', () => {
	const {container} = render(
		<Star innerRadius={200} outerRadius={150} points={5} />
	);

	expect(container.querySelector('path')?.getAttribute('d')).toEqual(
		'M 150 0 L 267.55705045849464 -11.803398874989483 L 292.658477444273 103.6474508437579 L 340.21130325903073 211.80339887498948 L 238.16778784387097 271.3525491562421 L 150 350 L 61.832212156129046 271.3525491562421 L -40.2113032590307 211.8033988749895 L 7.341522555726954 103.64745084375791 L 32.44294954150536 -11.803398874989455 L 150 0 Z'
	);
});
