import {expect, test} from 'bun:test';
import type {OpenAiVerboseTranscription} from '../openai-format';
import {openAiWhisperApiToCaptions} from '../openai-whisper-api-to-captions';

const transcript1: OpenAiVerboseTranscription = {
	task: 'transcribe',
	text: 'it is 99% better',
	words: [
		{
			start: 1,
			end: 2,
			word: 'it',
		},
		{
			start: 2,
			end: 3,
			word: 'is',
		},
		{
			start: 3,
			end: 4,
			word: '99',
		},
		{
			start: 4,
			end: 5,
			word: 'better',
		},
	],
	duration: 3,
	language: 'english',
};

const transcript2: OpenAiVerboseTranscription = {
	task: 'transcribe',
	text: 'in real-time functions.',
	words: [
		{
			end: 1,
			word: 'in',
			start: 0,
		},
		{
			end: 2,
			word: 'real',
			start: 1,
		},
		{
			end: 3,
			word: 'time',
			start: 2,
		},
		{
			end: 4,
			word: 'functions',
			start: 3,
		},
	],
	duration: 4,
	language: 'english',
};

test('Regression test 1', () => {
	expect(
		openAiWhisperApiToCaptions({transcription: transcript1}).captions,
	).toEqual([
		{
			confidence: null,
			endMs: 2000,
			startMs: 1000,
			text: 'it',
			timestampMs: 1500,
		},
		{
			confidence: null,
			endMs: 3000,
			startMs: 2000,
			text: ' is',
			timestampMs: 2500,
		},
		{
			confidence: null,
			endMs: 4000,
			startMs: 3000,
			text: ' 99%',
			timestampMs: 3500,
		},
		{
			confidence: null,
			endMs: 5000,
			startMs: 4000,
			text: ' better',
			timestampMs: 4500,
		},
	]);
});
test('Regression test 2', () => {
	expect(
		openAiWhisperApiToCaptions({transcription: transcript2}).captions,
	).toEqual([
		{
			confidence: null,
			endMs: 1000,
			startMs: 0,
			text: 'in',
			timestampMs: 500,
		},
		{
			confidence: null,
			endMs: 2000,
			startMs: 1000,
			text: ' real-',
			timestampMs: 1500,
		},
		{
			confidence: null,
			endMs: 3000,
			startMs: 2000,
			text: 'time',
			timestampMs: 2500,
		},
		{
			confidence: null,
			endMs: 4000,
			startMs: 3000,
			text: ' functions.',
			timestampMs: 3500,
		},
	]);
});
