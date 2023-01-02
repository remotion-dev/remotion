import {createHash} from 'crypto';
import {copyFile} from 'fs/promises';
import type {DownloadMap} from '../assets/download-map';
import {spawnCompositorOrReuse} from './compositor';
import type {CompositorImageFormat, Layer} from './payloads';

type CompositorInput = {
	height: number;
	width: number;
	layers: Layer[];
	imageFormat: CompositorImageFormat;
};

const getCompositorHash = ({...input}: CompositorInput): string => {
	return createHash('sha256').update(JSON.stringify(input)).digest('base64');
};

export const compose = async ({
	height,
	width,
	layers,
	output,
	downloadMap,
	imageFormat,
	renderId,
}: CompositorInput & {
	downloadMap: DownloadMap;
	output: string;
	renderId: string;
}) => {
	const hash = getCompositorHash({height, width, layers, imageFormat});

	if (downloadMap.compositorCache[hash]) {
		await copyFile(downloadMap.compositorCache[hash], output);
		return;
	}

	const compositor = spawnCompositorOrReuse(renderId);

	const ran = Math.random();
	console.time('start' + ran);
	await compositor.executeCommand({
		v: 1,
		height,
		width,
		layers,
		output,
		output_format: imageFormat,
	});
	console.timeEnd('start' + ran);

	downloadMap.compositorCache[hash] = output;
};
