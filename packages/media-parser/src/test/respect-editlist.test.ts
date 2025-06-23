import {getRemoteExampleVideo} from '@remotion/example-videos';
import {beforeAll, expect, test} from 'bun:test';
import {mediaParserController} from '../controller/media-parser-controller';
import {hasBeenAborted} from '../errors';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';
import {WEBCODECS_TIMESCALE} from '../webcodecs-timescale';

beforeAll(async () => {
	await getRemoteExampleVideo('videoWithEditList');
});

test('respect-editlist', async () => {
	const controller = mediaParserController();

	try {
		await parseMedia({
			src: await getRemoteExampleVideo('videoWithEditList'),
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			fields: {
				slowStructure: true,
			},
			controller,
			onAudioTrack: ({track}) => {
				expect(track.startInSeconds).toBe(0.23);
				return (sample) => {
					const time = sample.timestamp / WEBCODECS_TIMESCALE;
					expect(time).toBe(0.23);
					controller.abort();
				};
			},
		});
		throw new Error('Should not reach this point');
	} catch (err) {
		if (!hasBeenAborted(err)) {
			throw err;
		}
	}
});
