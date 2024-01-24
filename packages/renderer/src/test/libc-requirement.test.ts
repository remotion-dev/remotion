import {expect, test} from 'vitest';
import {gLibCErrorMessage} from '../check-version-requirements';

test('Libc requirement', () => {
	expect(gLibCErrorMessage('2.35')).toBe(null);

	const message = gLibCErrorMessage('2.34');
	expect(message).toBe(
		'Rendering videos requires glibc 2.35 or higher. Your system has glibc 2.34.',
	);
});
