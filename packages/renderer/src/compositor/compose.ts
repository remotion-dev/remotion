import {createHash} from 'crypto';
import {copyFile} from 'fs/promises';
import type {DownloadMap} from '../assets/download-map';
import {spawnCompositorOrReuse} from './compositor';
import type {
	CompositorImageFormat,
	CompositorInitiatePayload,
	CompositorLayer,
} from './payloads';

type CompositorInput = {
	height: number;
	width: number;
	layers: CompositorLayer[];
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
	compositorInitiatePayload,
}: CompositorInput & {
	downloadMap: DownloadMap;
	output: string;
	renderId: string;
	compositorInitiatePayload: CompositorInitiatePayload;
}) => {
	const hash = getCompositorHash({height, width, layers, imageFormat});

	if (downloadMap.compositorCache[hash]) {
		await copyFile(downloadMap.compositorCache[hash], output);
		return;
	}

	const compositor = spawnCompositorOrReuse({
		initiatePayload: compositorInitiatePayload,
		renderId,
	});

	await compositor.executeCommand({
		v: 1,
		height,
		width,
		layers,
		output,
		output_format: imageFormat,
	});

	downloadMap.compositorCache[hash] = output;
};
