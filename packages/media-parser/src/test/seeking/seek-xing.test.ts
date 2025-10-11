import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';
import {WEBCODECS_TIMESCALE} from '../../webcodecs-timescale';

test('seek-xing', async () => {
	const controller = mediaParserController();

	controller.seek(10);

	await parseMedia({
		src: exampleVideos.mp3vbr,
		reader: nodeReader,
		controller,
		acknowledgeRemotionLicense: true,
		fields: {
			durationInSeconds: true,
		},
		onDurationInSeconds: (duration) => {
			expect(duration).toBe(31.660408163265306);
		},
		onAudioTrack: () => {
			let samples = 0;
			return (sample) => {
				samples++;
				if (samples === 1) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(9.978333);
				}

				if (samples === 2) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(10.005548);
					controller.seek(20);
				}

				if (samples === 3) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(19.99599);
					controller.seek(30);
				}

				if (samples === 4) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(29.975858);
				}

				if (samples === 5) {
					expect(sample.timestamp / WEBCODECS_TIMESCALE).toBe(30.006213);
				}
			};
		},
	});

	const seeks = controller._internals.performedSeeksSignal.getPerformedSeeks();
	expect(seeks).toEqual([
		{
			from: 782,
			to: 73504,
			type: 'user-initiated',
		},
		{
			from: 73868,
			to: 146251,
			type: 'user-initiated',
		},
		{
			from: 146534,
			to: 217793,
			type: 'user-initiated',
		},
	]);

	const seekingHints = await controller.getSeekingHints();
	expect(seekingHints).toEqual({
		type: 'mp3-seeking-hints',
		audioSampleMap: [
			{
				timeInSeconds: 0.01360759013762848,
				offset: 156,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 9.978333814278203,
				offset: 73530,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 10.005548994553461,
				offset: 73686,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 19.995990483810388,
				offset: 146378,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 29.975858286740422,
				offset: 217811,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.006213680124368,
				offset: 218072,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.036569073508307,
				offset: 218333,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.066924466892246,
				offset: 218594,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.091115738248032,
				offset: 218802,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.12147113163197,
				offset: 219063,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.151826525015913,
				offset: 219324,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.182181918399852,
				offset: 219585,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.21253731178379,
				offset: 219846,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.242892705167733,
				offset: 220107,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.273248098551672,
				offset: 220368,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.30360349193561,
				offset: 220629,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.333958885319557,
				offset: 220890,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.3643142787035,
				offset: 221151,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.39466967208744,
				offset: 221412,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.425025065471377,
				offset: 221673,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.455380458855316,
				offset: 221934,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.48573585223926,
				offset: 222195,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.5160912456232,
				offset: 222456,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.54028251697898,
				offset: 222664,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.57063791036292,
				offset: 222925,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.594829181718705,
				offset: 223133,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.61902045307449,
				offset: 223341,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.6401878155108,
				offset: 223523,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.664379086866585,
				offset: 223731,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.685546449302894,
				offset: 223913,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.70973772065868,
				offset: 224121,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.733928992014462,
				offset: 224329,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.758120263370248,
				offset: 224537,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.779287625806557,
				offset: 224719,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.800454988242873,
				offset: 224901,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.82464625959865,
				offset: 225109,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.845813622034967,
				offset: 225291,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.870004893390746,
				offset: 225499,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.894196164746532,
				offset: 225707,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.918387436102318,
				offset: 225915,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.942578707458097,
				offset: 226123,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.963746069894412,
				offset: 226305,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 30.984913432330725,
				offset: 226487,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.006080794767033,
				offset: 226669,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.02724815720335,
				offset: 226851,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.048415519639658,
				offset: 227033,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.069582882075967,
				offset: 227215,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.087726335592805,
				offset: 227371,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.111917606948584,
				offset: 227579,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.1330849693849,
				offset: 227761,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.15727624074068,
				offset: 227969,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.178443603176994,
				offset: 228151,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.202634874532777,
				offset: 228359,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.22380223696909,
				offset: 228541,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.24799350832487,
				offset: 228749,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.27834890170881,
				offset: 229010,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.302540173064596,
				offset: 229218,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.33289556644854,
				offset: 229479,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.357086837804324,
				offset: 229687,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.387442231188263,
				offset: 229948,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.417797624572202,
				offset: 230209,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.44815301795614,
				offset: 230470,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.478508411340083,
				offset: 230731,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.50269968269587,
				offset: 230939,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.53910289391876,
				offset: 231252,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.569458287302698,
				offset: 231513,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.593649558658477,
				offset: 231721,
				durationInSeconds: 0.026122448979591838,
			},
			{
				timeInSeconds: 31.624004952042416,
				offset: 231982,
				durationInSeconds: 0.026122448979591838,
			},
		],
		lastSampleObserved: true,
		mp3BitrateInfo: {
			type: 'variable',
			xingData: {
				sampleRate: 44100,
				numberOfFrames: 1212,
				fileSize: 232295,
				tableOfContents: [
					0, 4, 7, 9, 12, 14, 17, 20, 22, 25, 27, 29, 32, 35, 37, 40, 42, 45,
					47, 50, 52, 54, 57, 59, 61, 64, 67, 70, 72, 75, 77, 80, 82, 85, 88,
					90, 93, 95, 98, 100, 103, 106, 108, 111, 113, 115, 118, 120, 123, 126,
					128, 131, 133, 136, 138, 141, 143, 146, 148, 151, 153, 156, 158, 161,
					163, 166, 168, 171, 173, 176, 178, 180, 183, 185, 188, 190, 193, 195,
					197, 200, 202, 205, 207, 210, 212, 215, 218, 220, 223, 225, 228, 230,
					233, 235, 238, 241, 244, 247, 250, 253,
				],
				vbrScale: 30,
			},
		},
		mp3Info: {layer: 3, mpegVersion: 1, sampleRate: 44100},
		mediaSection: {start: 156, size: 232139},
		contentLength: 232295,
	});
});
