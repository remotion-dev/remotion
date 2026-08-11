import {expect, test} from 'bun:test';
import {getLatestRemotionVersion} from '../get-latest-remotion-version';

test(
	'Should be able to get a Remotion version',
	async () => {
		expect(await getLatestRemotionVersion()).toMatch(
			/^(([0-9]+)\.([0-9]+)\.([0-9]+))$/,
		);
	},
	{timeout: 10000, retry: 3},
);
