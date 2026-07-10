import {expect, test} from 'bun:test';
import {HLS, MP4, QTFF, WEBM} from 'mediabunny';
import {
	isConvertEnabledByDefault,
	isVideoOnlySection,
} from '../app/lib/default-ui';
import {
	getDefaultConvertOutputFormat,
	getDefaultEditOutputFormat,
} from '../app/lib/get-default-output-format';

test('treats crop as a video-only operation section', () => {
	expect(isVideoOnlySection('crop')).toBe(true);
});

test('treats trim as a video-only operation section', () => {
	expect(isVideoOnlySection('trim')).toBe(true);
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

test('only enables the convert controls by default on conversion pages', () => {
	expect(
		isConvertEnabledByDefault({
			type: 'convert',
			input: 'mp4',
			output: 'webm',
		}),
	).toBe(true);
	expect(isConvertEnabledByDefault({type: 'generic-convert'})).toBe(true);
	expect(isConvertEnabledByDefault({type: 'generic-trim'})).toBe(false);
	expect(isConvertEnabledByDefault({type: 'trim-format', format: 'mp4'})).toBe(
		false,
	);
	expect(isConvertEnabledByDefault({type: 'generic-crop'})).toBe(false);
	expect(isConvertEnabledByDefault({type: 'generic-resize'})).toBe(false);
	expect(isConvertEnabledByDefault({type: 'generic-rotate'})).toBe(false);
	expect(isConvertEnabledByDefault({type: 'generic-mirror'})).toBe(false);
});

test('keeps the input container by default on editing pages', () => {
	expect(getDefaultEditOutputFormat(MP4)).toBe('mp4');
	expect(getDefaultEditOutputFormat(WEBM)).toBe('webm');
	expect(getDefaultEditOutputFormat(QTFF)).toBe('mov');
	expect(getDefaultEditOutputFormat(HLS)).toBe('mp4');
});

test('uses conversion defaults when enabling convert controls', () => {
	expect(
		getDefaultConvertOutputFormat({
			inputContainer: MP4,
			action: {type: 'generic-trim'},
		}),
	).toBe('webm');
	expect(
		getDefaultConvertOutputFormat({
			inputContainer: HLS,
			action: {type: 'generic-trim'},
		}),
	).toBe('mp4');
	expect(
		getDefaultConvertOutputFormat({
			inputContainer: MP4,
			action: {type: 'convert', input: 'mp4', output: 'mov'},
		}),
	).toBe('mov');
});

test('uses conversion defaults on conversion pages', () => {
	expect(
		getDefaultConvertOutputFormat({
			inputContainer: MP4,
			action: {type: 'generic-convert'},
		}),
	).toBe('webm');
	expect(
		getDefaultConvertOutputFormat({
			inputContainer: HLS,
			action: {type: 'generic-convert'},
		}),
	).toBe('mp4');
});
