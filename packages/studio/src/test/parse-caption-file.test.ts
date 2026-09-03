import {expect, test} from 'bun:test';
import {parseCaptionFile} from '../components/parse-caption-file';

const parseJson = (value: unknown) => {
	return parseCaptionFile({
		fileName: 'captions.json',
		contents: JSON.stringify(value),
	});
};

test('imports supported caption and transcription formats', () => {
	const remotion = parseJson([
		{
			text: 'Hello',
			startMs: 0,
			endMs: 500,
			timestampMs: 250,
			confidence: null,
		},
	]);
	expect(remotion).toEqual({
		format: 'remotion',
		captions: [
			{
				text: 'Hello',
				startMs: 0,
				endMs: 500,
				timestampMs: 250,
				confidence: null,
			},
		],
	});
	expect(parseJson([])).toEqual({format: 'remotion', captions: []});

	const elevenLabs = parseJson({
		language_code: 'eng',
		text: 'Hello world',
		words: [
			{text: 'Hello', type: 'word', start: 0, end: 0.4},
			{text: ' ', type: 'spacing', start: 0.4, end: 0.5},
			{text: 'world', type: 'word', start: 0.5, end: 0.9},
		],
	});
	expect(elevenLabs.format).toBe('elevenlabs');
	expect(elevenLabs.captions.map(({text}) => text)).toEqual([
		'Hello',
		' world',
	]);

	const segmented = parseJson({
		language_code: 'eng',
		segments: [
			{
				text: 'Hello world',
				start_time: 0,
				end_time: 0.9,
				words: [
					{text: 'Hello', start_time: 0, end_time: 0.4},
					{text: ' ', start_time: 0.4, end_time: 0.5},
					{text: 'world', start_time: 0.5, end_time: 0.9},
				],
			},
		],
	});
	expect(segmented).toEqual({
		format: 'elevenlabs-segments',
		captions: [
			{
				confidence: null,
				endMs: 400,
				startMs: 0,
				text: 'Hello',
				timestampMs: 200,
			},
			{
				confidence: null,
				endMs: 900,
				startMs: 400,
				text: ' world',
				timestampMs: 650,
			},
		],
	});

	const openAi = parseJson({
		duration: 0.9,
		language: 'english',
		task: 'transcribe',
		text: 'Hello, world!',
		words: [
			{word: 'Hello', start: 0, end: 0.4},
			{word: 'world', start: 0.5, end: 0.9},
		],
	});
	expect(openAi.format).toBe('openai-whisper');
	expect(openAi.captions.map(({text}) => text)).toEqual(['Hello,', ' world!']);

	const srt = parseCaptionFile({
		fileName: 'CAPTIONS.SRT',
		contents: '1\n00:00:00,000 --> 00:00:01,000\nHello world\n',
	});
	expect(srt.format).toBe('srt');
	expect(srt.captions[0]).toEqual({
		confidence: 1,
		endMs: 1000,
		startMs: 0,
		text: 'Hello world',
		timestampMs: 500,
	});
});

test.each([
	{
		name: 'invalid JSON',
		fileName: 'captions.json',
		contents: '{',
		error: 'Invalid JSON:',
	},
	{
		name: 'unknown JSON',
		fileName: 'captions.json',
		contents: JSON.stringify({language: 'english', utterances: []}),
		error: 'Found top-level keys: language, utterances',
	},
	{
		name: 'OpenAI response without words',
		fileName: 'captions.json',
		contents: JSON.stringify({
			duration: 1,
			language: 'english',
			text: 'Hello',
		}),
		error: 'timestamp_granularities: ["word"]',
	},
	{
		name: 'malformed ElevenLabs segmented word',
		fileName: 'captions.json',
		contents: JSON.stringify({
			language_code: 'eng',
			segments: [
				{
					text: 'Hello',
					start_time: 0,
					end_time: 1,
					words: [{text: 'Hello', end_time: 1}],
				},
			],
		}),
		error: 'segments[0].words[0].start_time must be a finite number',
	},
	{
		name: 'malformed ElevenLabs API word',
		fileName: 'captions.json',
		contents: JSON.stringify({
			language_code: 'eng',
			text: 'Hello',
			words: [{type: 'word', text: 'Hello', start: 'now', end: 1}],
		}),
		error:
			'Detected ElevenLabs JSON, but Invalid ElevenLabs transcript: words[0].start',
	},
	{
		name: 'malformed OpenAI Whisper word',
		fileName: 'captions.json',
		contents: JSON.stringify({
			duration: 1,
			language: 'english',
			text: 'Hello',
			words: [{word: 'Hello', start: 0, end: 'later'}],
		}),
		error:
			'Detected OpenAI Whisper JSON, but Invalid OpenAI Whisper transcription: words[0].end',
	},
	{
		name: 'invalid canonical confidence',
		fileName: 'captions.json',
		contents: JSON.stringify([
			{
				text: 'Hello',
				startMs: 0,
				endMs: 1,
				timestampMs: 0.5,
				confidence: 2,
			},
		]),
		error: 'captions[0].confidence must be between 0 and 1',
	},
	{
		name: 'reversed canonical timing',
		fileName: 'captions.json',
		contents: JSON.stringify([
			{
				text: 'Hello',
				startMs: 2,
				endMs: 1,
				timestampMs: 1.5,
				confidence: null,
			},
		]),
		error: 'captions[0].endMs must not be earlier than startMs',
	},
	{
		name: 'out-of-order canonical captions',
		fileName: 'captions.json',
		contents: JSON.stringify([
			{
				text: 'Later',
				startMs: 2,
				endMs: 3,
				timestampMs: 2.5,
				confidence: null,
			},
			{
				text: 'Earlier',
				startMs: 1,
				endMs: 2,
				timestampMs: 1.5,
				confidence: null,
			},
		]),
		error: 'captions[1].startMs is out of timestamp order',
	},
])('rejects $name', ({fileName, contents, error}) => {
	expect(() => parseCaptionFile({fileName, contents})).toThrow(error);
});
