import {calculateSignature} from '../../shared/invoke-webhook';

test('calculateSignature should return correct sha1 signature', () => {
		const signature = calculateSignature(JSON.stringify({payload: 'test'}))

		expect(signature).toEqual('sha1=01b2eb8a50128fbe37f67acc440fbaff1159c454');
	}
);
