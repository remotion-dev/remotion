import {getVideoMetadata} from '@remotion/media-utils';
import type {CanvasContent} from 'remotion';
import {staticFile} from 'remotion';
import {getPreviewFileType} from '../components/Preview';
import type {Dimensions} from './is-current-selected-still';

const getSrcFromCanvasContent = (canvasContent: CanvasContent) => {
	if (canvasContent.type === 'asset') {
		return staticFile(canvasContent.asset);
	}

	if (canvasContent.type === 'composition') {
		throw new Error('cannot get dimensions for composition');
	}

	return (
		window.remotion_staticBase.replace('static', 'outputs') + canvasContent.path
	);
};

export const getAssetMetadata = async (
	canvasContent: CanvasContent,
): Promise<Dimensions | 'none' | null> => {
	const src = getSrcFromCanvasContent(canvasContent);

	const fileType = getPreviewFileType(src);

	if (fileType === 'video') {
		const resolution = await getVideoMetadata(src);
		return {width: resolution.width, height: resolution.height};
	}

	if (fileType === 'image') {
		const resolution = await new Promise<{
			width: number;
			height: number;
		}>((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				resolve({width: img.width, height: img.height});
			};

			img.onerror = () => {
				reject(new Error('Failed to load image'));
			};

			img.src = src;
		});
		return {width: resolution.width, height: resolution.height};
	}

	return null;
};
