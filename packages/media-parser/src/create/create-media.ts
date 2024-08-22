import type {WriterInterface} from '../writers/writer';
import {makeMatroskaHeader} from './matroska-header';

export const createMedia = async (writer: WriterInterface) => {
	const header = makeMatroskaHeader();

	const w = await writer.createContent();
	await w.write(header);

	return async () => {
		await w.save();
	};
};
