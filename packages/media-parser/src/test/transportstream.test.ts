import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Transport stream', async () => {
	const {structure} = await parseMedia({
		src: exampleVideos.transportstream,
		fields: {
			durationInSeconds: true,
			structure: true,
		},
		reader: nodeReader,
	});
	expect(structure.boxes[0]).toEqual({
		adaptationFieldControl1: 1,
		adaptationFieldControl2: 1,
		adaptionField: {
			adaptationFieldExtensionFlag: 0,
			adaptationFieldLength: 1,
			discontinuityIndicator: 1,
			elementaryStreamPriorityIndicator: 0,
			opcrFlag: 0,
			pcrFlag: 0,
			randomAccessIndicator: 1,
			splicingPointFlag: 0,
			transportPrivateDataFlag: 0,
			type: 'transport-stream-adaptation-field',
		},
		continuityCounter: 0,
		packetIdentifier: 0,
		payloadUnitStartIndicator: 1,
		syncByte: 71,
		transportErrorIndicator: 0,
		transportPriority: 0,
		transportScramblingControl: 0,
		type: 'transport-stream-header',
	});
});
