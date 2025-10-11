import {expect, test} from 'bun:test';
import {getArrayBufferIterator} from '../iterator/buffer-iterator';
import {getHvc1CodecString} from '../make-hvc1-codec-strings';

test('video submitted by tella should have correct hvc1 codec string', () => {
	const codecString = getHvc1CodecString(
		getArrayBufferIterator({
			initialData: new Uint8Array([
				1, 34, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 240, 0, 252, 253,
			]),
			maxBytes: 200,
			logLevel: 'error',
		}),
	);

	expect(codecString).toBe('2.4.H150');
});
