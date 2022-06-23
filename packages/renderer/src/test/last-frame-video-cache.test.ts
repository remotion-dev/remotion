import crypto from 'crypto';
import {
	clearLastFileCache,
	getLastFrameFromCache,
	LastFrameOptions,
	setLastFrameInCache,
} from '../last-frame-from-video-cache';

const makeKey = (id: string): LastFrameOptions => {
	return {
		ffmpegExecutable: null,
		ffprobeExecutable: null,
		offset: 10,
		src: id,
		imageFormat: 'jpeg',
		isVp9Video: false,
	};
};

test('Last frame video cache', () => {
	expect(getLastFrameFromCache(makeKey('1'))).toBe(null);

	const buf = crypto.randomBytes(10 * 1024 * 1024);
	setLastFrameInCache(makeKey('1'), buf);
	expect(getLastFrameFromCache(makeKey('1'))?.byteLength).toBe(
		10 * 1024 * 1024
	);
	setLastFrameInCache(makeKey('2'), buf);
	setLastFrameInCache(makeKey('3'), buf);
	setLastFrameInCache(makeKey('4'), buf);
	setLastFrameInCache(makeKey('5'), buf);
	setLastFrameInCache(makeKey('6'), buf);

	expect(getLastFrameFromCache(makeKey('1'))?.byteLength ?? 0).toBe(0);
	expect(getLastFrameFromCache(makeKey('2'))?.byteLength).toBe(
		10 * 1024 * 1024
	);
	expect(getLastFrameFromCache(makeKey('3'))?.byteLength).toBe(
		10 * 1024 * 1024
	);
	expect(getLastFrameFromCache(makeKey('4'))?.byteLength).toBe(
		10 * 1024 * 1024
	);
	expect(getLastFrameFromCache(makeKey('5'))?.byteLength).toBe(
		10 * 1024 * 1024
	);
	expect(getLastFrameFromCache(makeKey('6'))?.byteLength).toBe(
		10 * 1024 * 1024
	);

	clearLastFileCache();
});
