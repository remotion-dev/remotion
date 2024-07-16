import {expect, test} from 'bun:test';
import {doesReactSupportTransformOriginProperty} from '../utils/does-react-support-canary';

test('Does React support transform-origin', () => {
	expect(
		doesReactSupportTransformOriginProperty('18.3.0-canary-2c338b16f-20231116'),
	).toBe(true);
	expect(doesReactSupportTransformOriginProperty('18.3.0')).toBe(false);
	expect(
		doesReactSupportTransformOriginProperty('18.3.0-canary-2c338b16f-20230116'),
	).toBe(false);
	expect(doesReactSupportTransformOriginProperty('18.2.0')).toBe(false);
});
