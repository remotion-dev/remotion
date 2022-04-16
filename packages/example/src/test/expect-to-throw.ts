import {expect, vitest} from 'vitest';

// eslint-disable-next-line @typescript-eslint/ban-types
export const expectToThrow = (func: Function, err: RegExp) => {
	// Even though the error is caught, it still gets printed to the console
	// so we mock that out to avoid the wall of red text.
	vitest.spyOn(console, 'error');
	// @ts-expect-error mock vitest
	console.error.mockImplementation(() => undefined);

	expect(func).toThrow(err);

	// @ts-expect-error vitest
	console.error.mockRestore();
};
