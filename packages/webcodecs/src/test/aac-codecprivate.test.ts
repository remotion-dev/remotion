import {expect, test} from 'bun:test';
import {createAacCodecPrivate} from '../create-aac-codecprivate';

test('AACCodecPrivate', () => {
	const codecPrivate = createAacCodecPrivate({
		audioObjectType: 2,
		sampleRate: 48000,
		channelConfiguration: 2,
	});
	expect(codecPrivate).toEqual(new Uint8Array([17, 144]));
});
