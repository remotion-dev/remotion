import {expect, test} from 'bun:test';
import type {OpenAiVerboseTranscription} from '../openai-format';
import {openAiWhisperApiToCaptions} from '../openai-whisper-api-to-captions';

const text = ' $500 that you can spend on a computer right now.';

const transcript: OpenAiVerboseTranscription = {
	task: 'transcribe',
	text,
	words: [
		{
			start: 1,
			end: 2,
			word: '$500',
		},
		{
			start: 3,
			end: 4,
			word: 'that',
		},
		{
			start: 5,
			end: 6,
			word: 'you',
		},
		{
			start: 7,
			end: 8,
			word: 'can',
		},
		{
			start: 9,
			end: 10,
			word: 'spend',
		},
		{
			start: 11,
			end: 12,
			word: 'on',
		},
		{
			start: 13,
			end: 14,
			word: 'a',
		},
		{
			start: 15,
			end: 16,
			word: 'computer',
		},
		{
			start: 17,
			end: 18,
			word: 'right',
		},
		{
			start: 19,
			end: 20,
			word: 'now.',
		},
	],
	duration: 4,
	language: 'english',
};

test('should not crash', () => {
	expect(openAiWhisperApiToCaptions({transcription: transcript})).toEqual({
		captions: [
			{
				confidence: null,
				endMs: 2000,
				startMs: 1000,
				text: ' $500',
				timestampMs: 1500,
			},
			{
				confidence: null,
				endMs: 4000,
				startMs: 3000,
				text: ' that',
				timestampMs: 3500,
			},
			{
				confidence: null,
				endMs: 6000,
				startMs: 5000,
				text: ' you',
				timestampMs: 5500,
			},
			{
				confidence: null,
				endMs: 8000,
				startMs: 7000,
				text: ' can',
				timestampMs: 7500,
			},
			{
				confidence: null,
				endMs: 10000,
				startMs: 9000,
				text: ' spend',
				timestampMs: 9500,
			},
			{
				confidence: null,
				endMs: 12000,
				startMs: 11000,
				text: ' on',
				timestampMs: 11500,
			},
			{
				confidence: null,
				endMs: 14000,
				startMs: 13000,
				text: ' a',
				timestampMs: 13500,
			},
			{
				confidence: null,
				endMs: 16000,
				startMs: 15000,
				text: ' computer',
				timestampMs: 15500,
			},
			{
				confidence: null,
				endMs: 18000,
				startMs: 17000,
				text: ' right',
				timestampMs: 17500,
			},
			{
				confidence: null,
				endMs: 20000,
				startMs: 19000,
				text: ' now.',
				timestampMs: 19500,
			},
		],
	});
});
