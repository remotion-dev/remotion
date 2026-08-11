import {expect, test} from 'bun:test';
import {calculateSignature} from '../invoke-webhook';

test('calculateSignature should return correct sha512 signature', () => {
	const signature = calculateSignature(
		JSON.stringify({payload: 'test'}),
		'INSECURE_DEFAULT_SECRET',
	);
	expect(signature).toEqual(
		'sha512=faa8735b7bac44d521749b45aa2c95cb6204822f54eb18f85aeb30b9a29d309a138f6b7358653336c592a69e29eb696ccc4f2c6c20335d3deb76b09efd4b6a5d',
	);
});
