import {mimeLookup} from '../mime-types';

test('Should get mime types', () => {
	expect(mimeLookup('hi.png')).toBe('image/png');
	expect(mimeLookup('hi.svg')).toBe('image/svg+xml');
	expect(mimeLookup('svg')).toBe('image/svg+xml');
});
