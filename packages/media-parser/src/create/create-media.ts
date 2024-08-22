import type {WriterInterface} from '../writers/writer';
import {makeMatroskaHeader} from './matroska-header';
import {makeMatroskaInfo} from './matroska-info';
import {createMatroskaSegment} from './matroska-segment';
import {
	makeMatroskaTracks,
	makeMatroskaVideoTrackEntryBytes,
} from './matroska-trackentry';

export const createMedia = async (writer: WriterInterface) => {
	const header = makeMatroskaHeader();

	const w = await writer.createContent();
	await w.write(header);
	const matroskaInfo = makeMatroskaInfo({
		timescale: 1_000_000,
		duration: 2658,
	});
	const matroskaTrackEntry = makeMatroskaVideoTrackEntryBytes({
		color: {
			transferChracteristics: 'bt709',
			matrixCoefficients: 'bt709',
			primaries: 'bt709',
			fullRange: true,
		},
		width: 1920,
		height: 1080,
		defaultDuration: 2658,
		trackNumber: 1,
		codecId: 'V_VP8',
	});
	const matroskaTracks = makeMatroskaTracks([matroskaTrackEntry]);
	const matroskaSegment = createMatroskaSegment([matroskaInfo, matroskaTracks]);

	await w.write(matroskaSegment);

	return async () => {
		await w.save();
	};
};
