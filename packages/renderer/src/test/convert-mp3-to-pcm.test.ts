import {getPcmOutputName} from '../convert-mp3-to-pcm';

test('Get a suitable output name', () => {
	expect(
		getPcmOutputName(
			'/var/folders/hs/mbxg3j_55ls1b_dhn50w32t00000gn/T/react-motion-graphicss0fL5r/d81af477293b97837ef8a0907301ba30.mp3'
		)
	).toBe(
		'/var/folders/hs/mbxg3j_55ls1b_dhn50w32t00000gn/T/react-motion-graphicss0fL5r/d81af477293b97837ef8a0907301ba30-converted.pcm'
	);
});
