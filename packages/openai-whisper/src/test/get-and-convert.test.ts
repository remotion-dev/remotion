import {expect, test} from 'bun:test';
import fs from 'fs';
import OpenAI from 'openai';
import path from 'path';
import {openAiWhisperApiToCaptions} from '../openai-whisper-api-to-captions';
import {testOutput} from './output';

test('Should convert to captions from mock', () => {
	const results = openAiWhisperApiToCaptions({transcription: testOutput});
	expect(results.captions.slice(0, 10)).toEqual([
		{
			confidence: null,
			endMs: 7039.999961853027,
			startMs: 6519.999980926514,
			text: "What's",
			timestampMs: 6779.9999713897705,
		},
		{
			confidence: null,
			endMs: 7559.999942779541,
			startMs: 7039.999961853027,
			text: ' up,',
			timestampMs: 7299.999952316284,
		},
		{
			confidence: null,
			endMs: 7880.000114440918,
			startMs: 7619.999885559082,
			text: ' everybody?',
			timestampMs: 7750,
		},
		{
			confidence: null,
			endMs: 8300.000190734863,
			startMs: 8239.999771118164,
			text: ' This',
			timestampMs: 8269.999980926514,
		},
		{
			confidence: null,
			endMs: 8699.999809265137,
			startMs: 8300.000190734863,
			text: ' is',
			timestampMs: 8500,
		},
		{
			confidence: null,
			endMs: 8899.999618530273,
			startMs: 8699.999809265137,
			text: ' Cortland',
			timestampMs: 8799.999713897705,
		},
		{
			confidence: null,
			endMs: 9159.99984741211,
			startMs: 8899.999618530273,
			text: ' from',
			timestampMs: 9029.999732971191,
		},
		{
			confidence: null,
			endMs: 9560.0004196167,
			startMs: 9159.99984741211,
			text: ' IndieHackers.',
			timestampMs: 9360.000133514404,
		},
		{
			confidence: null,
			endMs: 10000,
			startMs: 9560.0004196167,
			text: 'com',
			timestampMs: 9780.00020980835,
		},
		{
			confidence: null,
			endMs: 10359.999656677246,
			startMs: 10000,
			text: ' and',
			timestampMs: 10179.999828338623,
		},
	]);
});

if (!process.env.CI) {
	test(
		'Should convert to captions',
		async () => {
			const openai = new OpenAI();
			const transcription = await openai.audio.transcriptions.create({
				file: fs.createReadStream(
					path.join(
						__dirname,
						'..',
						'..',
						'..',
						'template-audiogram',
						'public',
						'audio.wav',
					),
				),
				model: 'whisper-1',
				response_format: 'verbose_json',
				prompt: 'Hello, welcome to my lecture.',
				timestamp_granularities: ['word'],
			});
			const {captions} = openAiWhisperApiToCaptions({transcription});
			expect(captions.length).toBeGreaterThan(400);
		},
		{timeout: 60000},
	);
}
