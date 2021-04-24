import {getAbsoluteSrc} from '../absolute-src';

test('Absolute src should behave as expected', () => {
	expect(getAbsoluteSrc('http://localhost:8080')).toBe(
		'http://localhost:8080/'
	);
	expect(getAbsoluteSrc('/hi')).toBe('http://localhost/hi');
	expect(getAbsoluteSrc('data:base64,image/png,abc')).toBe(
		'data:base64,image/png,abc'
	);
});
