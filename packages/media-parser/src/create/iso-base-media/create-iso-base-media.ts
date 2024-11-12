import type {MediaFnGeneratorInput} from '../media-fn';
import {createIsoBaseMediaFtyp} from './create-ftyp';

export const createIsoBaseMedia = async ({
	writer,
}: MediaFnGeneratorInput): Promise<void> => {
	const header = createIsoBaseMediaFtyp();

	const w = await writer.createContent();
	await w.write(header);
	return undefined;
};
