import type {BaseBox} from './base-type';

export interface DimensionsBox extends BaseBox {
	width: number;
	height: number;
	type: 'dims-box';
}

export const parseDims = (data: Buffer, offset: number): DimensionsBox => {
	console.log({data});
	const width = data.readUInt16BE(offset);
	const height = data.readUInt16BE(offset + 2);

	return {
		width,
		height,
		boxSize: data.length,
		offset,
		type: 'dims-box',
	};
};
