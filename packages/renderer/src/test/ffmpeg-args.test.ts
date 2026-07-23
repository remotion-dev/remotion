import {afterEach, expect, test} from 'bun:test';
import type {Codec} from '../codec';
import {generateFfmpegArgs} from '../ffmpeg-args';
import {DEFAULT_COLOR_SPACE} from '../options/color-space';
import type {HardwareAccelerationOption} from '../options/hardware-acceleration';

const originalPlatform = process.platform;

const setPlatform = (platform: string) => {
	Object.defineProperty(process, 'platform', {value: platform});
};

const restorePlatform = () => {
	Object.defineProperty(process, 'platform', {value: originalPlatform});
};

afterEach(restorePlatform);

const makeArgs = ({
	codec,
	crf = null,
	hardwareAcceleration,
}: {
	codec: Codec;
	crf?: number | null;
	hardwareAcceleration: HardwareAccelerationOption;
}) =>
	generateFfmpegArgs({
		hasPreencoded: false,
		proResProfileName: null,
		pixelFormat: 'yuv420p',
		x264Preset: null,
		gopSize: null,
		codec,
		crf,
		videoBitrate: null,
		encodingMaxRate: null,
		encodingBufferSize: null,
		colorSpace: DEFAULT_COLOR_SPACE,
		hardwareAcceleration,
		indent: false,
		logLevel: 'info',
	}).flat();

test('does not pass the default CRF option to hardware encoders', () => {
	setPlatform('linux');

	const args = makeArgs({
		codec: 'h264',
		hardwareAcceleration: 'if-possible',
	});

	expect(args).toContain('h264_nvenc');
	expect(args).not.toContain('-crf');
});

test('keeps default CRF for software encoders when hardware acceleration is not used', () => {
	setPlatform('linux');

	const args = makeArgs({
		codec: 'vp8',
		hardwareAcceleration: 'if-possible',
	});

	expect(args).toContain('libvpx');
	expect(args).toContain('-crf');
	expect(args).toContain('9');
});

test('keeps explicit CRF when if-possible falls back to software', () => {
	setPlatform('linux');

	const args = makeArgs({
		codec: 'h264',
		crf: 20,
		hardwareAcceleration: 'if-possible',
	});

	expect(args).toContain('libx264');
	expect(args).toContain('-crf');
	expect(args).toContain('20');
});
