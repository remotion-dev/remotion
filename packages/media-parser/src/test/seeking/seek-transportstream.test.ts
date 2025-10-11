import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('should seek transport stream', async () => {
	const controller = mediaParserController();

	let samples = 0;

	const result = await parseMedia({
		src: exampleVideos.transportstream,
		controller,
		reader: nodeReader,
		onVideoTrack: () => {
			return (sample) => {
				samples++;
				if (samples === 20) {
					controller.seek(10);
					expect(sample.decodingTimestamp).toBe(316666.6666666666);
				}

				if (samples === 21) {
					expect(sample.decodingTimestamp).toBe(0);
				}
			};
		},
		acknowledgeRemotionLicense: true,
	});

	expect(result).toBeDefined();
});
