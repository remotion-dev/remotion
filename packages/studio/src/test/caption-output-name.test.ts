import {expect, test} from 'bun:test';
import {
	getDefaultCaptionOutputName,
	validateCaptionOutputName,
} from '../components/Transcription/caption-output-name';

test('derives a caption JSON name from local and remote media sources', () => {
	expect(getDefaultCaptionOutputName('/interview.mp4')).toBe(
		'interview-captions.json',
	);
	expect(
		getDefaultCaptionOutputName(
			'https://example.com/media/My%20Interview.wav?token=secret',
		),
	).toBe('My-Interview-captions.json');
	expect(
		getDefaultCaptionOutputName(
			`data:audio/wav;base64,${'A'.repeat(1_000_000)}`,
			'<Audio>',
		),
	).toBe('Audio-captions.json');
	expect(
		getDefaultCaptionOutputName(
			`  data:audio/wav;base64,${'A'.repeat(1_000_000)}`,
			'<Audio>',
		),
	).toBe('Audio-captions.json');
});

test('accepts safe nested Caption[] output paths', () => {
	expect(validateCaptionOutputName('captions/interview.json')).toBeNull();
	expect(validateCaptionOutputName('captions/interview.JSON')).toBeNull();
});

test.each([
	'',
	' captions.json',
	'/captions.json',
	'C:/captions.json',
	'captions\\output.json',
	'captions\0output.json',
	'captions//output.json',
	'captions/./output.json',
	'captions/../output.json',
	'captions/..output.json',
	'captions?.json',
	'captions.txt',
])('rejects unsafe or unsupported output path %s', (outName) => {
	expect(validateCaptionOutputName(outName)).not.toBeNull();
});
