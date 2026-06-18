import {expect, test} from 'bun:test';
import {isVideoOnlySection} from '../app/lib/default-ui';

test('treats crop as a video-only operation section', () => {
	expect(isVideoOnlySection('crop')).toBe(true);
});

test('treats rotate, mirror, and resize as video-only operation sections', () => {
	expect(isVideoOnlySection('rotate')).toBe(true);
	expect(isVideoOnlySection('mirror')).toBe(true);
	expect(isVideoOnlySection('resize')).toBe(true);
});

test('keeps conversion and resampling available for audio-only files', () => {
	expect(isVideoOnlySection('convert')).toBe(false);
	expect(isVideoOnlySection('resample')).toBe(false);
});
