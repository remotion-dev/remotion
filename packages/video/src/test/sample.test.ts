import {ALL_FORMATS, Input, UrlSource, VideoSampleSink} from 'mediabunny';
import {test} from 'vitest';

test('sample', async () => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(
			'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
		),
	});

	const track = await input.getPrimaryVideoTrack();
	if (!track) {
		throw new Error(`No video track found`);
	}

	for (let j = 0; j < 20; j++) {
		const videoSampleSink = new VideoSampleSink(track);

		const samples = videoSampleSink.samples();
		for (let i = 0; i < 44; i++) {
			const sample = await samples.next();
			if (sample.value) {
				sample.value.close();
			}
		}

		await samples.return();
	}
});
