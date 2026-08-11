import {expect, test} from 'bun:test';
import type {OpenAiVerboseTranscription} from '../openai-format';
import {openAiWhisperApiToCaptions} from '../openai-whisper-api-to-captions';

export const transcript: OpenAiVerboseTranscription = {
	task: 'transcribe',
	text: 'which is a massive.',
	words: [
		{
			end: 12.180000305175781,
			word: 'which',
			start: 12.079999923706055,
		},
		{
			end: 12.300000190734863,
			word: 'is',
			start: 12.180000305175781,
		},
		{
			end: 12.619999885559082,
			word: 'a',
			start: 12.300000190734863,
		},
		{
			end: 12.779999732971191,
			word: 'massive',
			start: 12.619999885559082,
		},
	],
	duration: 12.779999732971191,
	language: 'english',
};

test('Partial word test', () => {
	expect(
		openAiWhisperApiToCaptions({transcription: transcript}).captions,
	).toEqual([
		{
			confidence: null,
			endMs: 12180.000305175781,
			startMs: 12079.999923706055,
			text: 'which',
			timestampMs: 12130.000114440918,
		},
		{
			confidence: null,
			endMs: 12300.000190734863,
			startMs: 12180.000305175781,
			text: ' is',
			timestampMs: 12240.000247955322,
		},
		{
			confidence: null,
			endMs: 12619.999885559082,
			startMs: 12300.000190734863,
			text: ' a',
			timestampMs: 12460.000038146973,
		},
		{
			confidence: null,
			endMs: 12779.999732971191,
			startMs: 12619.999885559082,
			text: ' massive.',
			timestampMs: 12699.999809265137,
		},
	]);
});
