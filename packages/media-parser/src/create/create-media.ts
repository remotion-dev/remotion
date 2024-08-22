import type {WriterInterface} from '../writers/writer';
import {makeMatroskaHeader} from './matroska-header';
import {makeMatroskaInfo} from './matroska-info';
import {createMatroskaSegment} from './matroska-segment';

export const createMedia = async (writer: WriterInterface) => {
	const header = makeMatroskaHeader();

	const w = await writer.createContent();
	await w.write(header);
	const matroskaInfo = makeMatroskaInfo({
		timescale: 1_000_000,
		duration: 2658,
	});
	const matroskaSegment = createMatroskaSegment(matroskaInfo);

	await w.write(matroskaSegment);

	return async () => {
		await w.save();
	};
};
