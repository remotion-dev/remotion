import {expect, test} from 'bun:test';
import type {OpenAiVerboseTranscription} from '../openai-format';
import {openAiWhisperApiToCaptions} from '../openai-whisper-api-to-captions';

test('issue 5069 case 1', () => {
	const res: OpenAiVerboseTranscription = {
		text: 'Like-minded.',
		task: 'transcribe',
		language: '',
		duration: 1.325,
		words: [
			{word: ' Like', start: 0, end: 0.5600000023841858},
			{word: '-minded.', start: 0.5600000023841858, end: 1.0800000429153442},
		],
	};

	const results = openAiWhisperApiToCaptions({transcription: res});

	expect(results).toEqual({
		captions: [
			{
				confidence: null,
				endMs: 560.0000023841858,
				startMs: 0,
				text: 'Like-',
				timestampMs: 280.0000011920929,
			},
			{
				confidence: null,
				endMs: 1080.0000429153442,
				startMs: 560.0000023841858,
				text: 'minded.',
				timestampMs: 820.000022649765,
			},
		],
	});
});

test('issue 5069 case 2', () => {
	const res: OpenAiVerboseTranscription = {
		text: '50,000.',
		task: 'transcribe',
		language: '',
		duration: 1.45,
		words: [
			{word: ' 50', start: 0, end: 0.5600000023841858},
			{word: ',000.', start: 0.5600000023841858, end: 1.1399999856948853},
		],
	};

	const results = openAiWhisperApiToCaptions({transcription: res});
	expect(results).toEqual({
		captions: [
			{
				confidence: null,
				endMs: 560.0000023841858,
				startMs: 0,
				text: '50,',
				timestampMs: 280.0000011920929,
			},
			{
				confidence: null,
				endMs: 1139.9999856948853,
				startMs: 560.0000023841858,
				text: '000.',
				timestampMs: 849.9999940395355,
			},
		],
	});
});
