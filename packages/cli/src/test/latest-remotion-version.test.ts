import {getLatestRemotionVersion} from '@remotion/studio/src/get-latest-remotion-version';
import {expect, test} from 'vitest';

test('Should be able to get a Remotion version', async () => {
	expect(await getLatestRemotionVersion()).toMatch(
		/^(([0-9]+)\.([0-9]+)\.([0-9]+))$/,
	);
});
