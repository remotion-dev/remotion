import {expect, test} from 'bun:test';
import {isServeUrl} from '../is-serve-url';

test("Should detect correctly whether it's a webpack URL or serve URL", () => {
	expect(isServeUrl('/tmp/rendering/index.html')).toBe(false);
	expect(isServeUrl('www.google.com')).toBe(true);
});
