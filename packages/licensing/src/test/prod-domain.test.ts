import {expect, test} from 'bun:test';
import {HOST} from '../register-usage-event';

test('should point to prod domain', () => {
	expect(HOST).toEqual('https://www.remotion.pro');
});
