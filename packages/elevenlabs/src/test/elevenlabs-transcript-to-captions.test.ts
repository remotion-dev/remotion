import {expect, test} from 'bun:test';
import type {ElevenLabsTranscript} from '../elevenlabs-transcript';
import {elevenLabsTranscriptToCaptions} from '../elevenlabs-transcript-to-captions';
import expectedCaptions from './gimme-gimme-captions-snapshot.json';
import transcript from './gimme-gimme-transcript.json';

test('converts elevenlabs transcript to captions', () => {
	const {captions} = elevenLabsTranscriptToCaptions({
		transcript: transcript as ElevenLabsTranscript,
	});

	expect(captions).toEqual(expectedCaptions);
});

test('handles invalid transcript input', () => {
	expect(() =>
		elevenLabsTranscriptToCaptions({
			transcript: {} as unknown as ElevenLabsTranscript,
		}),
	).toThrowError(/Invalid ElevenLabs transcript/);
});

test('handles empty words array', () => {
	const {captions} = elevenLabsTranscriptToCaptions({
		transcript: {
			language_code: 'eng',
			language_probability: 1,
			text: '',
			words: [],
			transcription_id: 'test',
		},
	});

	expect(captions).toEqual([]);
});
