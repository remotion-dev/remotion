import {describe, expect, test} from 'bun:test';
import {getFrameToFreeze, getNumberOfSamples} from '../src/CameraMotionBlur';

const getFreezeFrames = ({
	currentFrame,
	shutterAngle = 180,
	samples = 10,
}: {
	currentFrame: number;
	shutterAngle?: number;
	samples?: number;
}) => {
	const shutterFraction = shutterAngle / 360;
	const actualSamples = getNumberOfSamples({
		currentFrame,
		samples,
		shutterFraction,
	});

	return new Array(actualSamples).fill(true).map((_, i) => {
		return getFrameToFreeze({
			currentFrame,
			shutterFraction,
			sample: i + 1,
			actualSamples,
		});
	});
};

describe('CameraMotionBlur frame sampling', () => {
	test('renders frame 0 without offset', () => {
		const freezeFrames = getFreezeFrames({currentFrame: 0});
		expect(freezeFrames).toHaveLength(1);
		expect(freezeFrames[0]).toBe(0);
	});

	test('samples past and current frames for motion blur', () => {
		const freezeFrames = getFreezeFrames({currentFrame: 5});
		expect(freezeFrames).toHaveLength(10);
		expect(freezeFrames.every((frame) => frame <= 5)).toBe(true);
		expect(freezeFrames.every((frame) => frame >= 0)).toBe(true);
		expect(freezeFrames[0]).toBeCloseTo(4.55);
		expect(freezeFrames[freezeFrames.length - 1]).toBe(5);
	});

	test('never goes into negative frame territory on early frames', () => {
		for (let frame = 0; frame <= 5; frame++) {
			const freezeFrames = getFreezeFrames({currentFrame: frame});
			expect(freezeFrames.every((frozenFrame) => frozenFrame >= 0)).toBe(true);
		}
	});

	test('handles zero shutter angle and zero samples safely', () => {
		expect(
			getNumberOfSamples({
				currentFrame: 0,
				samples: 10,
				shutterFraction: 0,
			}),
		).toBe(1);
		expect(
			getNumberOfSamples({
				currentFrame: 5,
				samples: 0,
				shutterFraction: 0.5,
			}),
		).toBe(1);
	});
});
