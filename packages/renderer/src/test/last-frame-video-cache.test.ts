import crypto from 'crypto';
import {
	clearLastFileCache,
	getLastFrameFromCache,
	setLastFrameInCache,
} from '../last-frame-from-video-cache';

test('Last frame video cache', () => {
	expect(getLastFrameFromCache('1')).toBe(null);

	const buf = crypto.randomBytes(10 * 1024 * 1024);
	setLastFrameInCache('1', buf);
	expect(getLastFrameFromCache('1')?.byteLength).toBe(10 * 1024 * 1024);
	setLastFrameInCache('2', buf);
	setLastFrameInCache('3', buf);
	setLastFrameInCache('4', buf);
	setLastFrameInCache('5', buf);
	setLastFrameInCache('6', buf);

	expect(getLastFrameFromCache('1')?.byteLength ?? 0).toBe(0);
	expect(getLastFrameFromCache('2')?.byteLength).toBe(10 * 1024 * 1024);
	expect(getLastFrameFromCache('3')?.byteLength).toBe(10 * 1024 * 1024);
	expect(getLastFrameFromCache('4')?.byteLength).toBe(10 * 1024 * 1024);
	expect(getLastFrameFromCache('5')?.byteLength).toBe(10 * 1024 * 1024);
	expect(getLastFrameFromCache('6')?.byteLength).toBe(10 * 1024 * 1024);

	clearLastFileCache();
});
