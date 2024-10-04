import {createTikTokStyleCaptions} from '@remotion/captions';
import {expect, test} from 'bun:test';
import {convertToCaptions} from '../convert-to-captions';
import {toCaptions} from '../to-captions';
import {examplePayload} from './example-payload';

test('Convert to captions - 200ms together', () => {
	const {captions} = toCaptions({
		whisperCppOutput: examplePayload,
	});
	const {pages} = createTikTokStyleCaptions({
		captions,
		combineTokensWithinMilliseconds: 200,
	});

	expect(pages).toEqual([
		{
			text: 'William',
			startMs: 40,
			tokens: [{text: 'William', fromMs: 40, toMs: 420}],
		},
		{
			text: 'just',
			startMs: 420,
			tokens: [{text: 'just', fromMs: 420, toMs: 650}],
		},
		{
			text: 'hit 100,000',
			startMs: 650,
			tokens: [
				{text: 'hit', fromMs: 650, toMs: 810},
				{text: ' 100', fromMs: 810, toMs: 1330},
				{text: ',', fromMs: 1330, toMs: 1440},
				{text: '000', fromMs: 1440, toMs: 1950},
			],
		},
		{
			text: 'YouTube',
			startMs: 1950,
			tokens: [{text: 'YouTube', fromMs: 1950, toMs: 2370}],
		},
		{
			text: 'subscribers',
			startMs: 2370,
			tokens: [{text: 'subscribers', fromMs: 2370, toMs: 3060}],
		},
		{
			text: 'And we',
			startMs: 3060,
			tokens: [
				{text: 'And', fromMs: 3060, toMs: 3190},
				{text: ' we', fromMs: 3190, toMs: 3280},
			],
		},
		{
			text: 'are going',
			startMs: 3280,
			tokens: [
				{text: 'are', fromMs: 3280, toMs: 3410},
				{text: ' going', fromMs: 3410, toMs: 3630},
			],
		},
		{
			text: 'to celebrate',
			startMs: 3630,
			tokens: [
				{text: 'to', fromMs: 3630, toMs: 3710},
				{text: ' celebrate', fromMs: 3710, toMs: 4130},
			],
		},
		{
			text: 'that',
			startMs: 4130,
			tokens: [{text: 'that', fromMs: 4130, toMs: 4340}],
		},
		{
			text: 'We thought',
			startMs: 4340,
			tokens: [
				{text: 'We', fromMs: 4340, toMs: 4500},
				{text: ' thought', fromMs: 4500, toMs: 5140},
			],
		},
		{
			text: 'about',
			startMs: 5140,
			tokens: [{text: 'about', fromMs: 5140, toMs: 5480}],
		},
		{
			text: 'to bake',
			startMs: 5480,
			tokens: [
				{text: 'to', fromMs: 5480, toMs: 5660},
				{text: ' bake', fromMs: 5660, toMs: 5980},
			],
		},
		{
			text: 'a cake',
			startMs: 5980,
			tokens: [
				{text: 'a', fromMs: 5980, toMs: 6080},
				{text: ' cake', fromMs: 6080, toMs: 6400},
			],
		},
		{
			text: 'We found',
			startMs: 6400,
			tokens: [
				{text: 'We', fromMs: 6400, toMs: 6540},
				{text: ' found', fromMs: 6540, toMs: 6900},
			],
		},
		{
			text: 'this',
			startMs: 6900,
			tokens: [{text: 'this', fromMs: 6900, toMs: 7200}],
		},
		{
			text: 'and it',
			startMs: 7200,
			tokens: [
				{text: 'and', fromMs: 7200, toMs: 7390},
				{text: ' it', fromMs: 7390, toMs: 7510},
			],
		},
		{
			text: 'reminded',
			startMs: 7510,
			tokens: [{text: 'reminded', fromMs: 7510, toMs: 8030}],
		},
		{
			text: 'us of',
			startMs: 8030,
			tokens: [
				{text: 'us', fromMs: 8030, toMs: 8170},
				{text: ' of', fromMs: 8170, toMs: 8260},
			],
		},
		{
			text: 'William',
			startMs: 8260,
			tokens: [{text: 'William', fromMs: 8260, toMs: 8740}],
		},
		{
			text: 'We hope',
			startMs: 8740,
			tokens: [
				{text: 'We', fromMs: 8740, toMs: 8850},
				{text: ' hope', fromMs: 8850, toMs: 9080},
			],
		},
		{
			text: 'he will',
			startMs: 9080,
			tokens: [
				{text: 'he', fromMs: 9080, toMs: 9190},
				{text: ' will', fromMs: 9190, toMs: 9420},
			],
		},
		{
			text: 'like',
			startMs: 9420,
			tokens: [{text: 'like', fromMs: 9420, toMs: 9650}],
		},
		{
			text: 'the cake',
			startMs: 9650,
			tokens: [
				{text: 'the', fromMs: 9650, toMs: 9820},
				{text: ' cake', fromMs: 9820, toMs: 10100},
			],
		},
		{
			text: "Let's start",
			startMs: 10100,
			tokens: [
				{text: 'Let', fromMs: 10100, toMs: 10220},
				{text: "'s", fromMs: 10220, toMs: 10300},
				{text: ' start', fromMs: 10300, toMs: 10570},
			],
		},
		{
			text: 'with the',
			startMs: 10570,
			tokens: [
				{text: 'with', fromMs: 10570, toMs: 10700},
				{text: ' the', fromMs: 10700, toMs: 10780},
			],
		},
		{
			text: 'dough',
			startMs: 10780,
			tokens: [{text: 'dough', fromMs: 10780, toMs: 11000}],
		},
		{
			text: 'By putting',
			startMs: 11000,
			tokens: [
				{text: 'By', fromMs: 11000, toMs: 11120},
				{text: ' putting', fromMs: 11120, toMs: 11550},
			],
		},
		{
			text: 'some',
			startMs: 11550,
			tokens: [{text: 'some', fromMs: 11550, toMs: 11790}],
		},
		{
			text: 'butter',
			startMs: 11790,
			tokens: [{text: 'butter', fromMs: 11790, toMs: 12180}],
		},
		{
			text: 'Some',
			startMs: 12180,
			tokens: [{text: 'Some', fromMs: 12180, toMs: 12750}],
		},
		{
			text: 'sugar',
			startMs: 12750,
			tokens: [{text: 'sugar', fromMs: 12750, toMs: 13380}],
		},
		{
			text: 'Eggs',
			startMs: 13380,
			tokens: [{text: 'Eggs', fromMs: 13380, toMs: 14580}],
		},
		{
			text: 'No frameworks,',
			startMs: 14580,
			tokens: [
				{text: 'No', fromMs: 14580, toMs: 14720},
				{text: ' frameworks', fromMs: 14720, toMs: 15440},
				{text: ',', fromMs: 15440, toMs: 15550},
			],
		},
		{
			text: 'just',
			startMs: 15550,
			tokens: [{text: 'just', fromMs: 15550, toMs: 15790}],
		},
		{
			text: 'vanilla',
			startMs: 15790,
			tokens: [{text: 'vanilla', fromMs: 15790, toMs: 16220}],
		},
		{
			text: 'Pinch',
			startMs: 16220,
			tokens: [
				{text: 'P', fromMs: 16220, toMs: 16300},
				{text: 'inch', fromMs: 16300, toMs: 16640},
			],
		},
		{
			text: 'of salt',
			startMs: 16640,
			tokens: [
				{text: 'of', fromMs: 16640, toMs: 16810},
				{text: ' salt', fromMs: 16810, toMs: 17180},
			],
		},
		{
			text: 'Some',
			startMs: 17180,
			tokens: [{text: 'Some', fromMs: 17180, toMs: 17480}],
		},
		{
			text: 'Nutella',
			startMs: 17480,
			tokens: [
				{text: 'Nut', fromMs: 17480, toMs: 17700},
				{text: 'ella', fromMs: 17700, toMs: 18020},
			],
		},
		{
			text: 'Some',
			startMs: 18020,
			tokens: [{text: 'Some', fromMs: 18020, toMs: 18280}],
		},
		{
			text: 'chocolate',
			startMs: 18280,
			tokens: [{text: 'chocolate', fromMs: 18280, toMs: 18880}],
		},
		{
			text: 'Baking',
			startMs: 18880,
			tokens: [
				{text: 'B', fromMs: 18880, toMs: 18980},
				{text: 'aking', fromMs: 18980, toMs: 19420},
			],
		},
		{
			text: 'powder',
			startMs: 19420,
			tokens: [{text: 'powder', fromMs: 19420, toMs: 19980}],
		},
		{
			text: 'And',
			startMs: 19980,
			tokens: [{text: 'And', fromMs: 19980, toMs: 20500}],
		},
		{
			text: 'flour',
			startMs: 20500,
			tokens: [{text: 'flour', fromMs: 20500, toMs: 21380}],
		},
		{
			text: 'Just',
			startMs: 21380,
			tokens: [{text: 'Just', fromMs: 21380, toMs: 21690}],
		},
		{
			text: 'massage',
			startMs: 21690,
			tokens: [{text: 'massage', fromMs: 21690, toMs: 22120}],
		},
		{
			text: 'in the',
			startMs: 22120,
			tokens: [
				{text: 'in', fromMs: 22120, toMs: 22250},
				{text: ' the', fromMs: 22250, toMs: 22450},
			],
		},
		{
			text: 'butter',
			startMs: 22450,
			tokens: [{text: 'butter', fromMs: 22450, toMs: 22880}],
		},
		{
			text: 'to give',
			startMs: 22880,
			tokens: [
				{text: 'to', fromMs: 22880, toMs: 23000},
				{text: ' give', fromMs: 23000, toMs: 23250},
			],
		},
		{
			text: 'it the',
			startMs: 23250,
			tokens: [
				{text: 'it', fromMs: 23250, toMs: 23380},
				{text: ' the', fromMs: 23380, toMs: 23590},
			],
		},
		{
			text: 'full',
			startMs: 23590,
			tokens: [{text: 'full', fromMs: 23590, toMs: 23890}],
		},
		{
			text: 'treatment',
			startMs: 23890,
			tokens: [{text: 'treatment', fromMs: 23890, toMs: 24380}],
		},
		{
			text: 'Fill',
			startMs: 24380,
			tokens: [{text: 'Fill', fromMs: 24380, toMs: 24740}],
		},
		{
			text: 'it in',
			startMs: 24740,
			tokens: [
				{text: 'it', fromMs: 24740, toMs: 24920},
				{text: ' in', fromMs: 24920, toMs: 25120},
			],
		},
		{
			text: 'Bake',
			startMs: 25120,
			tokens: [{text: 'Bake', fromMs: 25120, toMs: 25570}],
		},
		{
			text: 'it for',
			startMs: 25570,
			tokens: [
				{text: 'it', fromMs: 25570, toMs: 25770},
				{text: ' for', fromMs: 25770, toMs: 26060},
			],
		},
		{
			text: 'half',
			startMs: 26060,
			tokens: [{text: 'half', fromMs: 26060, toMs: 26480}],
		},
		{
			text: 'an',
			startMs: 26480,
			tokens: [{text: 'an', fromMs: 26480, toMs: 26690}],
		},
		{
			text: 'hour',
			startMs: 26690,
			tokens: [{text: 'hour', fromMs: 26690, toMs: 27110}],
		},
		{
			text: 'at 170',
			startMs: 27110,
			tokens: [
				{text: 'at', fromMs: 27110, toMs: 27300},
				{text: ' 170', fromMs: 27300, toMs: 28170},
			],
		},
		{
			text: 'degrees',
			startMs: 28170,
			tokens: [{text: 'degrees', fromMs: 28170, toMs: 28800}],
		},
		{
			text: "It's time",
			startMs: 28850,
			tokens: [
				{text: 'It', fromMs: 28850, toMs: 28900},
				{text: "'s", fromMs: 28900, toMs: 29000},
				{text: ' time', fromMs: 29000, toMs: 29210},
			],
		},
		{
			text: 'for the',
			startMs: 29210,
			tokens: [
				{text: 'for', fromMs: 29210, toMs: 29400},
				{text: ' the', fromMs: 29400, toMs: 29530},
			],
		},
		{
			text: 'icing',
			startMs: 29530,
			tokens: [{text: 'icing', fromMs: 29530, toMs: 29800}],
		},
		{
			text: 'on the',
			startMs: 29800,
			tokens: [
				{text: 'on', fromMs: 29800, toMs: 29900},
				{text: ' the', fromMs: 29900, toMs: 30060},
			],
		},
		{
			text: 'cake',
			startMs: 30060,
			tokens: [{text: 'cake', fromMs: 30060, toMs: 30320}],
		},
		{
			text: 'Time',
			startMs: 30320,
			tokens: [{text: 'Time', fromMs: 30320, toMs: 30940}],
		},
		{
			text: 'for',
			startMs: 30940,
			tokens: [{text: 'for', fromMs: 30940, toMs: 31410}],
		},
		{
			text: 'the',
			startMs: 31410,
			tokens: [{text: 'the', fromMs: 31410, toMs: 31880}],
		},
		{
			text: 'most',
			startMs: 31880,
			tokens: [{text: 'most', fromMs: 31880, toMs: 32500}],
		},
		{
			text: 'critical',
			startMs: 32500,
			tokens: [{text: 'critical', fromMs: 32500, toMs: 33750}],
		},
		{
			text: 'part',
			startMs: 33750,
			tokens: [{text: 'part', fromMs: 33750, toMs: 34400}],
		},
		{
			text: 'This',
			startMs: 34400,
			tokens: [{text: 'This', fromMs: 34400, toMs: 35840}],
		},
		{
			text: 'is',
			startMs: 35840,
			tokens: [{text: 'is', fromMs: 35840, toMs: 36580}],
		},
		{
			text: 'how',
			startMs: 36580,
			tokens: [{text: 'how', fromMs: 36580, toMs: 37670}],
		},
		{
			text: 'it',
			startMs: 37670,
			tokens: [{text: 'it', fromMs: 37670, toMs: 38420}],
		},
		{
			text: 'turned',
			startMs: 38420,
			tokens: [{text: 'turned', fromMs: 38420, toMs: 40580}],
		},
		{
			text: 'out',
			startMs: 40580,
			tokens: [{text: 'out', fromMs: 40580, toMs: 41700}],
		},
		{
			text: 'Stupid',
			startMs: 41700,
			tokens: [{text: 'Stupid', fromMs: 41700, toMs: 42750}],
		},
		{
			text: 'idea,',
			startMs: 42750,
			tokens: [
				{text: 'idea', fromMs: 42750, toMs: 43440},
				{text: ',', fromMs: 43440, toMs: 43590},
			],
		},
		{
			text: 'pretty',
			startMs: 43590,
			tokens: [{text: 'pretty', fromMs: 43590, toMs: 44070}],
		},
		{
			text: 'bad',
			startMs: 44070,
			tokens: [{text: 'bad', fromMs: 44070, toMs: 44310}],
		},
		{
			text: 'execution',
			startMs: 44310,
			tokens: [{text: 'execution', fromMs: 44310, toMs: 45040}],
		},
		{
			text: 'I hope',
			startMs: 45040,
			tokens: [
				{text: 'I', fromMs: 45040, toMs: 45140},
				{text: ' hope', fromMs: 45140, toMs: 45530},
			],
		},
		{
			text: 'he likes',
			startMs: 45530,
			tokens: [
				{text: 'he', fromMs: 45530, toMs: 45730},
				{text: ' likes', fromMs: 45730, toMs: 46220},
			],
		},
		{
			text: 'it anyway',
			startMs: 46220,
			tokens: [
				{text: 'it', fromMs: 46220, toMs: 46420},
				{text: ' anyway', fromMs: 46420, toMs: 47040},
			],
		},
		{
			text: 'Hey',
			startMs: 47040,
			tokens: [{text: 'Hey', fromMs: 47040, toMs: 48030}],
		},
		{
			text: 'William',
			startMs: 48030,
			tokens: [{text: 'William', fromMs: 48030, toMs: 50340}],
		},
		{
			text: 'Congrats',
			startMs: 50340,
			tokens: [
				{text: 'Cong', fromMs: 50340, toMs: 51970},
				{text: 'rats', fromMs: 51970, toMs: 53580},
			],
		},
		{
			text: 'We',
			startMs: 53580,
			tokens: [{text: 'We', fromMs: 53580, toMs: 53790}],
		},
		{
			text: 'wanted',
			startMs: 53790,
			tokens: [{text: 'wanted', fromMs: 53790, toMs: 54440}],
		},
		{
			text: 'to congratulate',
			startMs: 54440,
			tokens: [
				{text: 'to', fromMs: 54440, toMs: 54640},
				{text: ' congratulate', fromMs: 54640, toMs: 55930},
			],
		},
		{
			text: 'you',
			startMs: 55930,
			tokens: [{text: 'you', fromMs: 55930, toMs: 56280}],
		},
		{
			text: 'on',
			startMs: 56280,
			tokens: [{text: 'on', fromMs: 56280, toMs: 56520}],
		},
		{
			text: 'the',
			startMs: 56520,
			tokens: [{text: 'the', fromMs: 56520, toMs: 56880}],
		},
		{
			text: '100,000',
			startMs: 56880,
			tokens: [
				{text: '100', fromMs: 56880, toMs: 57980},
				{text: ',', fromMs: 57980, toMs: 58010},
				{text: '000', fromMs: 58010, toMs: 58180},
			],
		},
		{
			text: 'You hear',
			startMs: 58690,
			tokens: [
				{text: 'You', fromMs: 58690, toMs: 58870},
				{text: ' hear', fromMs: 58870, toMs: 59150},
			],
		},
		{
			text: 'Joseph',
			startMs: 59150,
			tokens: [{text: 'Joseph', fromMs: 59150, toMs: 59570}],
		},
		{
			text: 'crying?',
			startMs: 59570,
			tokens: [
				{text: 'crying', fromMs: 59570, toMs: 59990},
				{text: '?', fromMs: 59990, toMs: 60220},
			],
		},
		{
			text: 'Thank',
			startMs: 60220,
			tokens: [{text: 'Thank', fromMs: 60220, toMs: 60820}],
		},
		{
			text: 'you',
			startMs: 60820,
			tokens: [{text: 'you', fromMs: 60820, toMs: 61180}],
		},
		{
			text: 'so',
			startMs: 61180,
			tokens: [{text: 'so', fromMs: 61180, toMs: 61420}],
		},
		{
			text: 'much',
			startMs: 61420,
			tokens: [{text: 'much', fromMs: 61420, toMs: 61920}],
		},
		{
			text: '(electronic',
			startMs: 61920,
			tokens: [
				{text: '(', fromMs: 61920, toMs: 62080},
				{text: 'elect', fromMs: 62080, toMs: 62880},
				{text: 'ronic', fromMs: 62880, toMs: 63680},
			],
		},
		{
			text: 'beeping)',
			startMs: 63680,
			tokens: [
				{text: 'be', fromMs: 63680, toMs: 63890},
				{text: 'eping', fromMs: 63890, toMs: 64800},
				{text: ')', fromMs: 64800, toMs: 65000},
			],
		},
	]);
});

test('Convert to captions - 0ms together', () => {
	const {captions: transcript} = convertToCaptions({
		transcription: examplePayload.transcription,
		combineTokensWithinMilliseconds: 0,
	});

	expect(transcript).toEqual([
		{text: 'William', startInSeconds: 0.24},
		{text: 'just', startInSeconds: 0.48},
		{text: 'hit', startInSeconds: 0.7},
		{text: '100,000', startInSeconds: 1.3},
		{text: 'YouTube', startInSeconds: 2.22},
		{text: 'subscribers', startInSeconds: 2.94},
		{text: 'And', startInSeconds: 3.24},
		{text: 'we', startInSeconds: 3.32},
		{text: 'are', startInSeconds: 3.42},
		{text: 'going', startInSeconds: 3.58},
		{text: 'to', startInSeconds: 3.76},
		{text: 'celebrate', startInSeconds: 4.1},
		{text: 'that', startInSeconds: 4.34},
		{text: 'We', startInSeconds: 4.5},
		{text: 'thought', startInSeconds: 4.7},
		{text: 'about', startInSeconds: 5.1},
		{text: 'to', startInSeconds: 5.42},
		{text: 'bake', startInSeconds: 5.92},
		{text: 'a', startInSeconds: 6.14},
		{text: 'cake', startInSeconds: 6.4},
		{text: 'We', startInSeconds: 6.56},
		{text: 'found', startInSeconds: 6.8},
		{text: 'this', startInSeconds: 7.12},
		{text: 'and', startInSeconds: 7.36},
		{text: 'it', startInSeconds: 7.5},
		{text: 'reminded', startInSeconds: 7.78},
		{text: 'us', startInSeconds: 8.04},
		{text: 'of', startInSeconds: 8.24},
		{text: 'William', startInSeconds: 8.52},
		{text: 'We', startInSeconds: 8.94},
		{text: 'hope', startInSeconds: 9.22},
		{text: 'he', startInSeconds: 9.42},
		{text: 'will', startInSeconds: 9.56},
		{text: 'like', startInSeconds: 9.68},
		{text: 'the', startInSeconds: 9.86},
		{text: 'cake', startInSeconds: 10.08},
		{text: "Let's", startInSeconds: 10.28},
		{text: 'start', startInSeconds: 10.46},
		{text: 'with', startInSeconds: 10.58},
		{text: 'the', startInSeconds: 10.68},
		{text: 'dough', startInSeconds: 10.96},
		{text: 'By', startInSeconds: 11.2},
		{text: 'putting', startInSeconds: 11.44},
		{text: 'some', startInSeconds: 11.64},
		{text: 'butter', startInSeconds: 12.06},
		{text: 'Some', startInSeconds: 12.86},
		{text: 'sugar', startInSeconds: 13.3},
		{text: 'Eggs', startInSeconds: 14.36},
		{text: 'No', startInSeconds: 14.78},
		{text: 'frameworks,', startInSeconds: 15.28},
		{text: 'just', startInSeconds: 15.68},
		{text: 'vanilla', startInSeconds: 16.1},
		{text: 'Pinch', startInSeconds: 16.38},
		{text: 'of', startInSeconds: 16.58},
		{text: 'salt', startInSeconds: 17.08},
		{text: 'Some', startInSeconds: 17.44},
		{text: 'Nutella', startInSeconds: 17.78},
		{text: 'Some', startInSeconds: 18.3},
		{text: 'chocolate', startInSeconds: 18.68},
		{text: 'Baking', startInSeconds: 19.12},
		{text: 'powder', startInSeconds: 19.76},
		{text: 'And', startInSeconds: 20.68},
		{text: 'flour', startInSeconds: 21.14},
		{text: 'Just', startInSeconds: 21.66},
		{text: 'massage', startInSeconds: 22.06},
		{text: 'in', startInSeconds: 22.38},
		{text: 'the', startInSeconds: 22.5},
		{text: 'butter', startInSeconds: 22.84},
		{text: 'to', startInSeconds: 23.08},
		{text: 'give', startInSeconds: 23.18},
		{text: 'it', startInSeconds: 23.32},
		{text: 'the', startInSeconds: 23.42},
		{text: 'full', startInSeconds: 23.76},
		{text: 'treatment', startInSeconds: 24.28},
		{text: 'Fill', startInSeconds: 24.54},
		{text: 'it', startInSeconds: 24.7},
		{text: 'in', startInSeconds: 25.32},
		{text: 'Bake', startInSeconds: 26.1},
		{text: 'it', startInSeconds: 26.3},
		{text: 'for', startInSeconds: 26.48},
		{text: 'half', startInSeconds: 26.64},
		{text: 'an', startInSeconds: 26.86},
		{text: 'hour', startInSeconds: 27.06},
		{text: 'at', startInSeconds: 27.4},
		{text: '170', startInSeconds: 28.14},
		{text: 'degrees', startInSeconds: 28.6},
		{text: "It's", startInSeconds: 28.84},
		{text: 'time', startInSeconds: 29.04},
		{text: 'for', startInSeconds: 29.28},
		{text: 'the', startInSeconds: 29.42},
		{text: 'icing', startInSeconds: 29.7},
		{text: 'on', startInSeconds: 29.88},
		{text: 'the', startInSeconds: 30.0},
		{text: 'cake', startInSeconds: 30.56},
		{text: 'Time', startInSeconds: 33.14},
		{text: 'for', startInSeconds: 33.34},
		{text: 'the', startInSeconds: 33.46},
		{text: 'most', startInSeconds: 33.62},
		{text: 'critical', startInSeconds: 34.0},
		{text: 'part', startInSeconds: 34.76},
		{text: 'This', startInSeconds: 40.74},
		{text: 'is', startInSeconds: 40.86},
		{text: 'how', startInSeconds: 41.0},
		{text: 'it', startInSeconds: 41.1},
		{text: 'turned', startInSeconds: 41.32},
		{text: 'out', startInSeconds: 42.02},
		{text: 'Stupid', startInSeconds: 42.78},
		{text: 'idea,', startInSeconds: 43.36},
		{text: 'pretty', startInSeconds: 43.7},
		{text: 'bad', startInSeconds: 44.02},
		{text: 'execution', startInSeconds: 44.72},
		{text: 'I', startInSeconds: 45.88},
		{text: 'hope', startInSeconds: 46.06},
		{text: 'he', startInSeconds: 46.2},
		{text: 'likes', startInSeconds: 46.38},
		{text: 'it', startInSeconds: 46.58},
		{text: 'anyway', startInSeconds: 47.56},
		{text: 'Hey', startInSeconds: 49.52},
		{text: 'William', startInSeconds: 50.06},
		{text: 'Congrats', startInSeconds: 52.32},
		{text: 'We', startInSeconds: 54.56},
		{text: 'wanted', startInSeconds: 54.86},
		{text: 'to', startInSeconds: 55.0},
		{text: 'congratulate', startInSeconds: 55.58},
		{text: 'you', startInSeconds: 56.22},
		{text: 'on', startInSeconds: 56.54},
		{text: 'the', startInSeconds: 56.68},
		{text: '100,000', startInSeconds: 57.14},
		{text: 'You', startInSeconds: 58.86},
		{text: 'hear', startInSeconds: 59.06},
		{text: 'Joseph', startInSeconds: 59.4},
		{text: 'crying?', startInSeconds: 59.74},
		{text: 'Thank', startInSeconds: 61.04},
		{text: 'you', startInSeconds: 61.18},
		{text: 'so', startInSeconds: 61.44},
		{text: 'much', startInSeconds: 61.76},
		{text: '(electronic', startInSeconds: 62.88},
		{text: 'beeping)', startInSeconds: 63.02},
	]);
});
