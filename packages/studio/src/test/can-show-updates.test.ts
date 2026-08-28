import {expect, test} from 'bun:test';
import {canShowUpdates} from '../helpers/can-show-updates';

test('only shows updates in a connected, writable desktop Studio', () => {
	expect(
		canShowUpdates({
			connectionStatus: 'connected',
			isBrowserStudio: false,
			readOnlyStudio: false,
		}),
	).toBe(true);

	for (const environment of [
		{
			connectionStatus: 'connected' as const,
			isBrowserStudio: false,
			readOnlyStudio: true,
		},
		{
			connectionStatus: 'connected' as const,
			isBrowserStudio: true,
			readOnlyStudio: false,
		},
		{
			connectionStatus: 'disconnected' as const,
			isBrowserStudio: false,
			readOnlyStudio: false,
		},
		{
			connectionStatus: 'init' as const,
			isBrowserStudio: false,
			readOnlyStudio: false,
		},
	]) {
		expect(canShowUpdates(environment)).toBe(false);
	}
});
