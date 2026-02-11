import {ALL_FORMATS, AudioSampleSink, Input, UrlSource} from 'mediabunny';
import {expect, test} from 'vitest';
import {convertAudioData} from '../convert-audiodata/convert-audiodata';

test('Audio samples from MP3 should produce identical s16 output on Chrome and Firefox', async () => {
	const input = new Input({
		source: new UrlSource('/sample-audio.mp3'),
		formats: ALL_FORMATS,
	});

	const audioTrack = await input.getPrimaryAudioTrack();
	if (!audioTrack) {
		throw new Error('No audio track found');
	}

	const decodable = await audioTrack.canDecode();
	expect(decodable).toBe(true);

	const sink = new AudioSampleSink(audioTrack);

	let sampleIndex = 0;

	for await (const sample of sink.samples()) {
		const audioData = sample.toAudioData();
		const {numberOfChannels, numberOfFrames, format} = audioData;

		expect(numberOfFrames).toBe(1152);
		expect(numberOfChannels).toBe(2);
		expect(format === 'f32' || format === 's16-planar').toBe(true);

		const result = convertAudioData({
			audioData,
			trimStartInSeconds: 0,
			trimEndInSeconds: 0,
			playbackRate: 1,
			audioDataTimestamp: audioData.timestamp / 1_000_000,
			isLast: false,
		});

		expect(result.numberOfFrames).toBe(numberOfFrames);
		expect(result.data.length).toBe(numberOfFrames * 2);

		const {data} = result;
		let sum = 0;
		for (let i = 0; i < data.length; i++) {
			sum += data[i];
		}

		const first10 = Array.from(data.slice(0, 10));
		const last10 = Array.from(data.slice(-10));

		expect(first10).toMatchSnapshot(`sample-${sampleIndex}-first10`);
		expect(last10).toMatchSnapshot(`sample-${sampleIndex}-last10`);
		expect(sum).toMatchSnapshot(`sample-${sampleIndex}-sum`);

		audioData.close();
		sampleIndex++;

		if (sampleIndex >= 10) {
			break;
		}
	}

	expect(sampleIndex).toBe(10);
});
