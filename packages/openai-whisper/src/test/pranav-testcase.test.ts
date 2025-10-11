/* eslint-disable no-loss-of-precision */
import {expect, test} from 'bun:test';
import type {OpenAiVerboseTranscription} from '../openai-format';
import {openAiWhisperApiToCaptions} from '../openai-whisper-api-to-captions';

export const transcript: OpenAiVerboseTranscription = {
	task: 'transcribe',
	language: 'english',
	duration: 65.66000366210938,
	text: "NVIDIA might just have changed computing forever by launching Digits, the world's first personal AI supercomputer. Imagine taking the world's biggest supercomputers, the ones present in massive research labs, shrinking it down and putting it on your desk. That's exactly what NVIDIA managed to do with this tiny box. But the real question is, how did they pull this off? Well, the secret is this incredible chip called the GB10 Grace Blackwell. They combined a super powerful GPU with a 20-core CPU and gave us a device that can handle up to 200 million parameters. Not just this, you can even connect two of these together and handle a whopping 405 billion parameters. It's insane. And if we are talking specs, it's packed with 128 GB of memory and can store up to 4 TB of data, ensuring you never run out of resources. But here's the craziest part. All of this runs on a regular power outlet, the same kind you use to charge your phone. Now, all this won't come cheap, obviously. So it's launching for $3,000 in May 2025. But remember, we're talking about innovation that we've never seen before. Think about it. Developers, researchers and students can now have supercomputer-level power in their home. It's crazy, but what do you think? Are you getting one?",
	words: [
		{
			word: 'NVIDIA',
			start: 0,
			end: 0.4399999976158142,
		},
		{
			word: 'might',
			start: 0.4399999976158142,
			end: 0.6800000071525574,
		},
		{
			word: 'just',
			start: 0.6800000071525574,
			end: 0.8999999761581421,
		},
		{
			word: 'have',
			start: 0.8999999761581421,
			end: 1.1200000047683716,
		},
		{
			word: 'changed',
			start: 1.1200000047683716,
			end: 1.399999976158142,
		},
		{
			word: 'computing',
			start: 1.399999976158142,
			end: 1.840000033378601,
		},
		{
			word: 'forever',
			start: 1.840000033378601,
			end: 2.299999952316284,
		},
		{
			word: 'by',
			start: 2.299999952316284,
			end: 2.619999885559082,
		},
		{
			word: 'launching',
			start: 2.619999885559082,
			end: 3,
		},
		{
			word: 'Digits',
			start: 3,
			end: 3.5,
		},
		{
			word: 'the',
			start: 3.740000009536743,
			end: 3.819999933242798,
		},
		{
			word: "world's",
			start: 3.819999933242798,
			end: 4.139999866485596,
		},
		{
			word: 'first',
			start: 4.139999866485596,
			end: 4.5,
		},
		{
			word: 'personal',
			start: 4.5,
			end: 4.980000019073486,
		},
		{
			word: 'AI',
			start: 4.980000019073486,
			end: 5.400000095367432,
		},
		{
			word: 'supercomputer',
			start: 5.400000095367432,
			end: 6.019999980926514,
		},
		{
			word: 'Imagine',
			start: 6.199999809265137,
			end: 6.480000019073486,
		},
		{
			word: 'taking',
			start: 6.480000019073486,
			end: 6.71999979019165,
		},
		{
			word: 'the',
			start: 6.71999979019165,
			end: 6.980000019073486,
		},
		{
			word: "world's",
			start: 6.980000019073486,
			end: 7.360000133514404,
		},
		{
			word: 'biggest',
			start: 7.360000133514404,
			end: 7.679999828338623,
		},
		{
			word: 'supercomputers',
			start: 7.679999828338623,
			end: 8.539999961853027,
		},
		{
			word: 'the',
			start: 8.819999694824219,
			end: 8.84000015258789,
		},
		{
			word: 'ones',
			start: 8.84000015258789,
			end: 9.140000343322754,
		},
		{
			word: 'present',
			start: 9.140000343322754,
			end: 9.520000457763672,
		},
		{
			word: 'in',
			start: 9.520000457763672,
			end: 9.800000190734863,
		},
		{
			word: 'massive',
			start: 9.800000190734863,
			end: 10.180000305175781,
		},
		{
			word: 'research',
			start: 10.180000305175781,
			end: 10.600000381469727,
		},
		{
			word: 'labs',
			start: 10.600000381469727,
			end: 10.960000038146973,
		},
		{
			word: 'shrinking',
			start: 11.279999732971191,
			end: 11.479999542236328,
		},
		{
			word: 'it',
			start: 11.479999542236328,
			end: 11.779999732971191,
		},
		{
			word: 'down',
			start: 11.779999732971191,
			end: 12.079999923706055,
		},
		{
			word: 'and',
			start: 12.079999923706055,
			end: 12.399999618530273,
		},
		{
			word: 'putting',
			start: 12.399999618530273,
			end: 12.5600004196167,
		},
		{
			word: 'it',
			start: 12.5600004196167,
			end: 12.699999809265137,
		},
		{
			word: 'on',
			start: 12.699999809265137,
			end: 12.800000190734863,
		},
		{
			word: 'your',
			start: 12.800000190734863,
			end: 13.180000305175781,
		},
		{
			word: 'desk',
			start: 13.180000305175781,
			end: 13.220000267028809,
		},
		{
			word: "That's",
			start: 13.34000015258789,
			end: 13.600000381469727,
		},
		{
			word: 'exactly',
			start: 13.600000381469727,
			end: 13.920000076293945,
		},
		{
			word: 'what',
			start: 13.920000076293945,
			end: 14.140000343322754,
		},
		{
			word: 'NVIDIA',
			start: 14.140000343322754,
			end: 14.399999618530273,
		},
		{
			word: 'managed',
			start: 14.399999618530273,
			end: 14.720000267028809,
		},
		{
			word: 'to',
			start: 14.720000267028809,
			end: 14.880000114440918,
		},
		{
			word: 'do',
			start: 14.880000114440918,
			end: 14.979999542236328,
		},
		{
			word: 'with',
			start: 14.979999542236328,
			end: 15.100000381469727,
		},
		{
			word: 'this',
			start: 15.100000381469727,
			end: 15.260000228881836,
		},
		{
			word: 'tiny',
			start: 15.260000228881836,
			end: 15.579999923706055,
		},
		{
			word: 'box',
			start: 15.579999923706055,
			end: 15.880000114440918,
		},
		{
			word: 'But',
			start: 16,
			end: 16.15999984741211,
		},
		{
			word: 'the',
			start: 16.15999984741211,
			end: 16.299999237060547,
		},
		{
			word: 'real',
			start: 16.299999237060547,
			end: 16.700000762939453,
		},
		{
			word: 'question',
			start: 16.700000762939453,
			end: 16.899999618530273,
		},
		{
			word: 'is',
			start: 16.899999618530273,
			end: 17.239999771118164,
		},
		{
			word: 'how',
			start: 17.34000015258789,
			end: 17.399999618530273,
		},
		{
			word: 'did',
			start: 17.399999618530273,
			end: 17.559999465942383,
		},
		{
			word: 'they',
			start: 17.559999465942383,
			end: 17.700000762939453,
		},
		{
			word: 'pull',
			start: 17.700000762939453,
			end: 17.940000534057617,
		},
		{
			word: 'this',
			start: 17.940000534057617,
			end: 18.18000030517578,
		},
		{
			word: 'off',
			start: 18.18000030517578,
			end: 18.3799991607666,
		},
		{
			word: 'Well',
			start: 18.5,
			end: 18.760000228881836,
		},
		{
			word: 'the',
			start: 18.860000610351562,
			end: 19.18000030517578,
		},
		{
			word: 'secret',
			start: 19.18000030517578,
			end: 19.34000015258789,
		},
		{
			word: 'is',
			start: 19.34000015258789,
			end: 19.559999465942383,
		},
		{
			word: 'this',
			start: 19.559999465942383,
			end: 19.799999237060547,
		},
		{
			word: 'incredible',
			start: 19.799999237060547,
			end: 20.420000076293945,
		},
		{
			word: 'chip',
			start: 20.420000076293945,
			end: 20.65999984741211,
		},
		{
			word: 'called',
			start: 20.65999984741211,
			end: 20.959999084472656,
		},
		{
			word: 'the',
			start: 20.959999084472656,
			end: 21.280000686645508,
		},
		{
			word: 'GB10',
			start: 21.280000686645508,
			end: 21.920000076293945,
		},
		{
			word: 'Grace',
			start: 21.920000076293945,
			end: 22.34000015258789,
		},
		{
			word: 'Blackwell',
			start: 22.34000015258789,
			end: 22.719999313354492,
		},
		{
			word: 'They',
			start: 22.799999237060547,
			end: 23.020000457763672,
		},
		{
			word: 'combined',
			start: 23.020000457763672,
			end: 23.360000610351562,
		},
		{
			word: 'a',
			start: 23.360000610351562,
			end: 23.700000762939453,
		},
		{
			word: 'super',
			start: 23.700000762939453,
			end: 23.899999618530273,
		},
		{
			word: 'powerful',
			start: 23.899999618530273,
			end: 24.100000381469727,
		},
		{
			word: 'GPU',
			start: 24.100000381469727,
			end: 24.520000457763672,
		},
		{
			word: 'with',
			start: 24.520000457763672,
			end: 24.780000686645508,
		},
		{
			word: 'a',
			start: 24.780000686645508,
			end: 25.020000457763672,
		},
		{
			word: '20',
			start: 25.020000457763672,
			end: 25.299999237060547,
		},
		{
			word: 'core',
			start: 25.299999237060547,
			end: 25.360000610351562,
		},
		{
			word: 'CPU',
			start: 25.360000610351562,
			end: 25.739999771118164,
		},
		{
			word: 'and',
			start: 25.739999771118164,
			end: 26.1200008392334,
		},
		{
			word: 'gave',
			start: 26.1200008392334,
			end: 26.260000228881836,
		},
		{
			word: 'us',
			start: 26.260000228881836,
			end: 26.399999618530273,
		},
		{
			word: 'a',
			start: 26.399999618530273,
			end: 26.81999969482422,
		},
		{
			word: 'device',
			start: 26.81999969482422,
			end: 26.81999969482422,
		},
		{
			word: 'that',
			start: 26.81999969482422,
			end: 27.040000915527344,
		},
		{
			word: 'can',
			start: 27.040000915527344,
			end: 27.440000534057617,
		},
		{
			word: 'handle',
			start: 27.440000534057617,
			end: 27.440000534057617,
		},
		{
			word: 'up',
			start: 27.440000534057617,
			end: 27.600000381469727,
		},
		{
			word: 'to',
			start: 27.600000381469727,
			end: 27.799999237060547,
		},
		{
			word: '200',
			start: 27.799999237060547,
			end: 28.3799991607666,
		},
		{
			word: 'million',
			start: 28.3799991607666,
			end: 28.68000030517578,
		},
		{
			word: 'parameters',
			start: 28.68000030517578,
			end: 29.139999389648438,
		},
		{
			word: 'Not',
			start: 29.139999389648438,
			end: 29.6200008392334,
		},
		{
			word: 'just',
			start: 29.6200008392334,
			end: 29.860000610351562,
		},
		{
			word: 'this',
			start: 29.860000610351562,
			end: 30.18000030517578,
		},
		{
			word: 'you',
			start: 30.360000610351562,
			end: 30.399999618530273,
		},
		{
			word: 'can',
			start: 30.399999618530273,
			end: 30.520000457763672,
		},
		{
			word: 'even',
			start: 30.520000457763672,
			end: 31,
		},
		{
			word: 'connect',
			start: 31,
			end: 31,
		},
		{
			word: 'two',
			start: 31,
			end: 31.239999771118164,
		},
		{
			word: 'of',
			start: 31.239999771118164,
			end: 31.420000076293945,
		},
		{
			word: 'these',
			start: 31.420000076293945,
			end: 31.540000915527344,
		},
		{
			word: 'together',
			start: 31.540000915527344,
			end: 31.8799991607666,
		},
		{
			word: 'and',
			start: 31.8799991607666,
			end: 32.18000030517578,
		},
		{
			word: 'handle',
			start: 32.18000030517578,
			end: 32.400001525878906,
		},
		{
			word: 'a',
			start: 32.400001525878906,
			end: 32.540000915527344,
		},
		{
			word: 'whopping',
			start: 32.540000915527344,
			end: 32.81999969482422,
		},
		{
			word: '405',
			start: 32.81999969482422,
			end: 33.560001373291016,
		},
		{
			word: 'billion',
			start: 33.560001373291016,
			end: 33.79999923706055,
		},
		{
			word: 'parameters',
			start: 33.79999923706055,
			end: 34.31999969482422,
		},
		{
			word: "It's",
			start: 34.68000030517578,
			end: 34.81999969482422,
		},
		{
			word: 'insane',
			start: 34.81999969482422,
			end: 35.34000015258789,
		},
		{
			word: 'And',
			start: 35.560001373291016,
			end: 35.65999984741211,
		},
		{
			word: 'if',
			start: 35.65999984741211,
			end: 35.7599983215332,
		},
		{
			word: 'we',
			start: 35.7599983215332,
			end: 35.86000061035156,
		},
		{
			word: 'are',
			start: 35.86000061035156,
			end: 36.220001220703125,
		},
		{
			word: 'talking',
			start: 36.220001220703125,
			end: 36.2599983215332,
		},
		{
			word: 'specs',
			start: 36.2599983215332,
			end: 36.65999984741211,
		},
		{
			word: "it's",
			start: 36.97999954223633,
			end: 37.119998931884766,
		},
		{
			word: 'packed',
			start: 37.119998931884766,
			end: 37.29999923706055,
		},
		{
			word: 'with',
			start: 37.29999923706055,
			end: 37.91999816894531,
		},
		{
			word: '128',
			start: 37.91999816894531,
			end: 38.34000015258789,
		},
		{
			word: 'GB',
			start: 38.34000015258789,
			end: 38.720001220703125,
		},
		{
			word: 'of',
			start: 38.720001220703125,
			end: 39.36000061035156,
		},
		{
			word: 'memory',
			start: 39.36000061035156,
			end: 39.36000061035156,
		},
		{
			word: 'and',
			start: 39.36000061035156,
			end: 39.599998474121094,
		},
		{
			word: 'can',
			start: 39.599998474121094,
			end: 39.939998626708984,
		},
		{
			word: 'store',
			start: 39.939998626708984,
			end: 40.119998931884766,
		},
		{
			word: 'up',
			start: 40.119998931884766,
			end: 40.380001068115234,
		},
		{
			word: 'to',
			start: 40.380001068115234,
			end: 40.599998474121094,
		},
		{
			word: '4',
			start: 40.599998474121094,
			end: 40.939998626708984,
		},
		{
			word: 'TB',
			start: 40.939998626708984,
			end: 41.2400016784668,
		},
		{
			word: 'of',
			start: 41.2400016784668,
			end: 41.86000061035156,
		},
		{
			word: 'data',
			start: 41.86000061035156,
			end: 41.86000061035156,
		},
		{
			word: 'ensuring',
			start: 42.060001373291016,
			end: 42.31999969482422,
		},
		{
			word: 'you',
			start: 42.31999969482422,
			end: 42.68000030517578,
		},
		{
			word: 'never',
			start: 42.68000030517578,
			end: 42.959999084472656,
		},
		{
			word: 'run',
			start: 42.959999084472656,
			end: 43.20000076293945,
		},
		{
			word: 'out',
			start: 43.20000076293945,
			end: 43.34000015258789,
		},
		{
			word: 'of',
			start: 43.34000015258789,
			end: 43.959999084472656,
		},
		{
			word: 'resources',
			start: 43.959999084472656,
			end: 43.959999084472656,
		},
		{
			word: 'But',
			start: 44.2400016784668,
			end: 44.31999969482422,
		},
		{
			word: "here's",
			start: 44.31999969482422,
			end: 44.5,
		},
		{
			word: 'the',
			start: 44.5,
			end: 44.97999954223633,
		},
		{
			word: 'craziest',
			start: 44.97999954223633,
			end: 44.97999954223633,
		},
		{
			word: 'part',
			start: 44.97999954223633,
			end: 45.279998779296875,
		},
		{
			word: 'All',
			start: 45.459999084472656,
			end: 45.58000183105469,
		},
		{
			word: 'of',
			start: 45.58000183105469,
			end: 45.720001220703125,
		},
		{
			word: 'this',
			start: 45.720001220703125,
			end: 45.900001525878906,
		},
		{
			word: 'runs',
			start: 45.900001525878906,
			end: 46.099998474121094,
		},
		{
			word: 'on',
			start: 46.099998474121094,
			end: 46.2400016784668,
		},
		{
			word: 'a',
			start: 46.2400016784668,
			end: 46.400001525878906,
		},
		{
			word: 'regular',
			start: 46.400001525878906,
			end: 46.7400016784668,
		},
		{
			word: 'power',
			start: 46.7400016784668,
			end: 47.099998474121094,
		},
		{
			word: 'outlet',
			start: 47.099998474121094,
			end: 47.34000015258789,
		},
		{
			word: 'the',
			start: 47.47999954223633,
			end: 47.619998931884766,
		},
		{
			word: 'same',
			start: 47.619998931884766,
			end: 47.939998626708984,
		},
		{
			word: 'kind',
			start: 47.939998626708984,
			end: 48.20000076293945,
		},
		{
			word: 'you',
			start: 48.20000076293945,
			end: 48.34000015258789,
		},
		{
			word: 'use',
			start: 48.34000015258789,
			end: 48.58000183105469,
		},
		{
			word: 'to',
			start: 48.58000183105469,
			end: 49,
		},
		{
			word: 'charge',
			start: 49,
			end: 49,
		},
		{
			word: 'your',
			start: 49,
			end: 49.2599983215332,
		},
		{
			word: 'phone',
			start: 49.2599983215332,
			end: 49.41999816894531,
		},
		{
			word: 'Now',
			start: 49.540000915527344,
			end: 49.86000061035156,
		},
		{
			word: 'all',
			start: 49.86000061035156,
			end: 50.15999984741211,
		},
		{
			word: 'this',
			start: 50.15999984741211,
			end: 50.380001068115234,
		},
		{
			word: "won't",
			start: 50.380001068115234,
			end: 50.58000183105469,
		},
		{
			word: 'come',
			start: 50.58000183105469,
			end: 50.86000061035156,
		},
		{
			word: 'cheap',
			start: 50.86000061035156,
			end: 51.099998474121094,
		},
		{
			word: 'obviously',
			start: 51.2400016784668,
			end: 51.560001373291016,
		},
		{
			word: 'So',
			start: 51.68000030517578,
			end: 51.81999969482422,
		},
		{
			word: "it's",
			start: 51.81999969482422,
			end: 52.2400016784668,
		},
		{
			word: 'launching',
			start: 52.2400016784668,
			end: 52.2400016784668,
		},
		{
			word: 'for',
			start: 52.2400016784668,
			end: 52.540000915527344,
		},
		{
			word: '3',
			start: 52.540000915527344,
			end: 53.08000183105469,
		},
		{
			word: '000',
			start: 53.08000183105469,
			end: 53.08000183105469,
		},
		{
			word: 'in',
			start: 53.08000183105469,
			end: 53.7400016784668,
		},
		{
			word: 'May',
			start: 53.7400016784668,
			end: 53.939998626708984,
		},
		{
			word: '2025',
			start: 53.939998626708984,
			end: 54.70000076293945,
		},
		{
			word: 'But',
			start: 54.86000061035156,
			end: 55.08000183105469,
		},
		{
			word: 'remember',
			start: 55.08000183105469,
			end: 55.380001068115234,
		},
		{
			word: "we're",
			start: 55.41999816894531,
			end: 55.7400016784668,
		},
		{
			word: 'talking',
			start: 55.7400016784668,
			end: 55.939998626708984,
		},
		{
			word: 'about',
			start: 55.939998626708984,
			end: 56.31999969482422,
		},
		{
			word: 'innovation',
			start: 56.31999969482422,
			end: 56.560001373291016,
		},
		{
			word: 'that',
			start: 56.560001373291016,
			end: 56.779998779296875,
		},
		{
			word: "we've",
			start: 56.779998779296875,
			end: 57.060001373291016,
		},
		{
			word: 'never',
			start: 57.060001373291016,
			end: 57.220001220703125,
		},
		{
			word: 'seen',
			start: 57.220001220703125,
			end: 57.439998626708984,
		},
		{
			word: 'before',
			start: 57.439998626708984,
			end: 57.720001220703125,
		},
		{
			word: 'Think',
			start: 57.86000061035156,
			end: 57.97999954223633,
		},
		{
			word: 'about',
			start: 57.97999954223633,
			end: 58.18000030517578,
		},
		{
			word: 'it',
			start: 58.18000030517578,
			end: 58.439998626708984,
		},
		{
			word: 'Developers',
			start: 58.439998626708984,
			end: 59.15999984741211,
		},
		{
			word: 'researchers',
			start: 59.84000015258789,
			end: 59.84000015258789,
		},
		{
			word: 'and',
			start: 59.84000015258789,
			end: 60.18000030517578,
		},
		{
			word: 'students',
			start: 60.18000030517578,
			end: 60.63999938964844,
		},
		{
			word: 'can',
			start: 60.63999938964844,
			end: 60.97999954223633,
		},
		{
			word: 'now',
			start: 60.97999954223633,
			end: 61.279998779296875,
		},
		{
			word: 'have',
			start: 61.279998779296875,
			end: 61.47999954223633,
		},
		{
			word: 'supercomputer',
			start: 61.47999954223633,
			end: 62,
		},
		{
			word: 'level',
			start: 62,
			end: 62.2599983215332,
		},
		{
			word: 'power',
			start: 62.2599983215332,
			end: 62.540000915527344,
		},
		{
			word: 'in',
			start: 62.540000915527344,
			end: 62.65999984741211,
		},
		{
			word: 'their',
			start: 62.65999984741211,
			end: 62.84000015258789,
		},
		{
			word: 'home',
			start: 62.84000015258789,
			end: 63.02000045776367,
		},
		{
			word: "It's",
			start: 63.20000076293945,
			end: 63.31999969482422,
		},
		{
			word: 'crazy',
			start: 63.31999969482422,
			end: 63.68000030517578,
		},
		{
			word: 'but',
			start: 63.880001068115234,
			end: 64.04000091552734,
		},
		{
			word: 'what',
			start: 64.04000091552734,
			end: 64.13999938964844,
		},
		{
			word: 'do',
			start: 64.13999938964844,
			end: 64.27999877929688,
		},
		{
			word: 'you',
			start: 64.27999877929688,
			end: 64.4800033569336,
		},
		{
			word: 'think',
			start: 64.4800033569336,
			end: 64.72000122070312,
		},
		{
			word: 'Are',
			start: 64.91999816894531,
			end: 64.95999908447266,
		},
		{
			word: 'you',
			start: 64.95999908447266,
			end: 65.05999755859375,
		},
		{
			word: 'getting',
			start: 65.05999755859375,
			end: 65.26000213623047,
		},
		{
			word: 'one',
			start: 65.26000213623047,
			end: 65.41999816894531,
		},
	],
};

test('should not crash', () => {
	expect(openAiWhisperApiToCaptions({transcription: transcript}).captions);
});
