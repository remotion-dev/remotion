import {expect} from 'bun:test';

export const expectToThrow = (func: Function, err: RegExp) => {
	expect(func).toThrow(err);
};
