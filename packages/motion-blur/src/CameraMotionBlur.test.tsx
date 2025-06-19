import {expect, test} from 'bun:test';

// Test the core logic of frame calculation for CameraMotionBlur
// This tests the mathematical formula without requiring full React rendering

/**
 * Helper function that mimics the getNumberOfSamples logic from CameraMotionBlur
 */
const getNumberOfSamples = ({
	shutterFraction,
	samples,
	currentFrame,
}: {
	shutterFraction: number;
	samples: number;
	currentFrame: number;
}) => {
	const maxOffset = shutterFraction * samples;
	const maxTimeReverse = currentFrame - maxOffset;
	const factor = Math.min(1, Math.max(0, maxTimeReverse / maxOffset + 1));
	return Math.max(1, Math.round(Math.min(factor * samples, samples)));
};

/**
 * Helper function that calculates the freeze frames that would be used
 */
const calculateFreezeFrames = (currentFrame: number, shutterAngle: number = 180, samples: number = 10): number[] => {
	const shutterFraction = shutterAngle / 360;
	const actualSamples = getNumberOfSamples({
		currentFrame,
		samples,
		shutterFraction,
	});

	const freezeFrames: number[] = [];
	for (let i = 0; i < actualSamples; i++) {
		const sample = i + 1;
		const sampleFrameOffset = shutterFraction * (sample / actualSamples);
		const freezeFrame = currentFrame - shutterFraction + sampleFrameOffset;
		freezeFrames.push(freezeFrame);
	}

	return freezeFrames;
};

test('CameraMotionBlur should freeze at current frame for frame 0', () => {
	const freezeFrames = calculateFreezeFrames(0);
	
	// For frame 0, we should get exactly 1 sample
	expect(freezeFrames).toHaveLength(1);
	
	// and it should be at frame 0 (not 0.5 or negative)
	expect(freezeFrames[0]).toBe(0);
});

test('CameraMotionBlur should freeze at past frames for frame 5', () => {
	const freezeFrames = calculateFreezeFrames(5);
	
	// For frame 5, we should get 10 samples (full samples)
	expect(freezeFrames).toHaveLength(10);
	
	// All frames should be between 4.5 and 5.0
	for (const frame of freezeFrames) {
		expect(frame).toBeGreaterThanOrEqual(4.5);
		expect(frame).toBeLessThanOrEqual(5.0);
	}
	
	// The frames should be in ascending order
	const sortedFrames = [...freezeFrames].sort((a, b) => a - b);
	expect(freezeFrames).toEqual(sortedFrames);
	
	// The last frame should be the current frame (5)
	expect(freezeFrames[freezeFrames.length - 1]).toBe(5);
});

test('CameraMotionBlur should never freeze at negative frames', () => {
	// Test multiple early frames
	for (let currentFrame = 0; currentFrame < 5; currentFrame++) {
		const freezeFrames = calculateFreezeFrames(currentFrame);
		
		// No frame should be negative
		for (const frame of freezeFrames) {
			expect(frame).toBeGreaterThanOrEqual(0);
		}
	}
});

test('CameraMotionBlur should have correct frame progression', () => {
	// Test that as currentFrame increases, the motion blur follows correctly
	const frame1Freeze = calculateFreezeFrames(1);
	const frame2Freeze = calculateFreezeFrames(2);
	
	// Frame 1 should have 2 samples
	expect(frame1Freeze).toHaveLength(2);
	expect(frame1Freeze[0]).toBe(0.75); // 1 - 0.5 + 0.25
	expect(frame1Freeze[1]).toBe(1.0);   // 1 - 0.5 + 0.5
	
	// Frame 2 should have more samples
	expect(frame2Freeze.length).toBeGreaterThan(frame1Freeze.length);
	
	// All frames should be non-negative
	for (const frame of [...frame1Freeze, ...frame2Freeze]) {
		expect(frame).toBeGreaterThanOrEqual(0);
	}
});