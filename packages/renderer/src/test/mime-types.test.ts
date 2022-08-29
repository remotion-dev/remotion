import {expect, test} from 'vitest';
import {getExt, mimeLookup} from '../mime-types';

test('Should get mime types', () => {
	expect(mimeLookup('hi.png')).toBe('image/png');
	expect(mimeLookup('hi.svg')).toBe('image/svg+xml');
});

test('Should be able to get extension', () => {
	expect(getExt('video/mp4')).toBe('mp4');
});
