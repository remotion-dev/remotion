import {expect, test} from 'bun:test';
import {rotateAndResizeVideoFrame} from '../rotate-and-resize-video-frame';

// Test that focuses on API structure and parameter validation
test('rotateAndResizeVideoFrame - function exists and has correct signature', () => {
	expect(typeof rotateAndResizeVideoFrame).toBe('function');
});

test('rotateAndResizeVideoFrame - throws error for invalid rotation', () => {
	// Mock VideoFrame that's sufficient for this test
	const mockFrame = {
		displayWidth: 100,
		displayHeight: 200,
		timestamp: 0,
		duration: 1000000,
		close: () => {},
	} as unknown as VideoFrame;

	expect(() => {
		rotateAndResizeVideoFrame({
			frame: mockFrame,
			rotation: 45, // Not a multiple of 90
			resizeOperation: null,
		});
	}).toThrow('Only 90 degree rotations are supported');
});

test('rotateAndResizeVideoFrame - accepts optional needsToBeMultipleOfTwo parameter', () => {
	// Mock VideoFrame that's sufficient for this test  
	const mockFrame = {
		displayWidth: 100,
		displayHeight: 200,
		timestamp: 0,
		duration: 1000000,
		close: () => {},
	} as unknown as VideoFrame;

	// Should not throw when needsToBeMultipleOfTwo is omitted
	expect(() => {
		rotateAndResizeVideoFrame({
			frame: mockFrame,
			rotation: 0,
			resizeOperation: null,
		});
	}).not.toThrow();

	// Should not throw when needsToBeMultipleOfTwo is explicitly provided
	expect(() => {
		rotateAndResizeVideoFrame({
			frame: mockFrame,
			rotation: 0,
			resizeOperation: null,
			needsToBeMultipleOfTwo: true,
		});
	}).not.toThrow();

	expect(() => {
		rotateAndResizeVideoFrame({
			frame: mockFrame,
			rotation: 0,
			resizeOperation: null,
			needsToBeMultipleOfTwo: false,
		});
	}).not.toThrow();
});