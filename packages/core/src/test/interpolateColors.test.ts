import {interpolateColors} from '../interpolateColors';
import {expectToThrow} from './expect-to-throw';

test('Throws if color space is not right', () => {
	expectToThrow(() => {
		//@ts-expect-error
		interpolateColors(1, [0, 1], ['#ffaadd', '#fabgdf'], 'GFR');
	}, /invalid color space provided: GFR. Supported values are: \['RGB', 'HSV'\]/);
});
