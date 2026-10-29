import {expect, test} from 'vitest';
import {cacheVideoFrame, getCachedVideoFrame} from '../video/video-frame-cache';

test('the reveal cache evicts least-recently-used frames and releases their pixels', () => {
	const source = new OffscreenCanvas(2048, 2048);
	const context = source.getContext('2d')!;
	context.fillStyle = '#ff0000';
	context.fillRect(0, 0, 2048, 2048);
	for (let i = 0; i < 4; i++) {
		cacheVideoFrame(`lru-${i}`, source);
	}

	const oldest = getCachedVideoFrame('lru-0')!;
	const evicted = getCachedVideoFrame('lru-1')!;
	// Make frame zero newest; frame one should now be evicted first.
	getCachedVideoFrame('lru-2');
	getCachedVideoFrame('lru-3');
	getCachedVideoFrame('lru-0');
	cacheVideoFrame('lru-4', source);
	expect(getCachedVideoFrame('lru-1')).toBeNull();
	expect([evicted.width, evicted.height]).toEqual([0, 0]);
	expect(getCachedVideoFrame('lru-0')).toBe(oldest);
	expect([...oldest.getContext('2d')!.getImageData(0, 0, 1, 1).data]).toEqual([
		255, 0, 0, 255,
	]);

	// Replacing a source's dimensions releases its previous backing store.
	source.width = 1024;
	source.height = 1024;
	cacheVideoFrame('lru-0', source);
	expect([oldest.width, oldest.height]).toEqual([0, 0]);
	expect(getCachedVideoFrame('lru-0')!.width).toBe(1024);

	// A frame larger than the whole budget must not displace useful entries.
	source.width = 4097;
	source.height = 4096;
	cacheVideoFrame('oversized', source);
	expect(getCachedVideoFrame('oversized')).toBeNull();
	expect(getCachedVideoFrame('lru-0')!.width).toBe(1024);
	source.width = 0;
	source.height = 0;
});
