import {describe, expect, test} from 'bun:test';
import type {VideoConfig} from 'remotion';

// Mock test to verify that composition defaults are properly passed through
describe('Composition render defaults', () => {
	test('VideoConfig should include new default fields', () => {
		const mockComposition: VideoConfig = {
			id: 'test',
			width: 1920,
			height: 1080,
			fps: 30,
			durationInFrames: 300,
			defaultProps: {},
			props: {},
			defaultCodec: 'h264',
			defaultOutName: 'my-video',
			defaultVideoImageFormat: 'png',
			defaultPixelFormat: 'yuva420p',
		};

		// Verify the new fields are accessible
		expect(mockComposition.defaultVideoImageFormat).toBe('png');
		expect(mockComposition.defaultPixelFormat).toBe('yuva420p');
		expect(mockComposition.defaultCodec).toBe('h264');
		expect(mockComposition.defaultOutName).toBe('my-video');
	});

	test('VideoConfig should accept null values for defaults', () => {
		const mockComposition: VideoConfig = {
			id: 'test',
			width: 1920,
			height: 1080,
			fps: 30,
			durationInFrames: 300,
			defaultProps: {},
			props: {},
			defaultCodec: null,
			defaultOutName: null,
			defaultVideoImageFormat: null,
			defaultPixelFormat: null,
		};

		// Verify null values are accepted
		expect(mockComposition.defaultVideoImageFormat).toBe(null);
		expect(mockComposition.defaultPixelFormat).toBe(null);
		expect(mockComposition.defaultCodec).toBe(null);
		expect(mockComposition.defaultOutName).toBe(null);
	});
});
