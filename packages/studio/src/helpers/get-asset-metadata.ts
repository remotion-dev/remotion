import {getVideoMetadata} from '@remotion/media-utils';
import type {CanvasContent} from 'remotion';
import {staticFile} from 'remotion';
import {getPreviewFileType} from '../components/Preview';
import type {Dimensions} from './is-current-selected-still';

export const remotion_outputsBase = window.remotion_staticBase.replace(
	'static',
	'outputs',
);

const getSrcFromCanvasContent = (canvasContent: CanvasContent) => {
	if (canvasContent.type === 'asset') {
		return staticFile(canvasContent.asset);
	}

	if (canvasContent.type === 'composition') {
		throw new Error('cannot get dimensions for composition');
	}

	return remotion_outputsBase + canvasContent.path;
};

export type AssetMetadata =
	| {
			type: 'not-found';
	  }
	| {
			type: 'found';
			size: number;
			dimensions: Dimensions | 'none' | null;
			fetchedAt: number;
	  };

export const getAssetMetadata = async (
	canvasContent: CanvasContent,
	addTime: boolean,
): Promise<AssetMetadata> => {
	const src = getSrcFromCanvasContent(canvasContent);

	const file = await fetch(src, {
		method: 'HEAD',
	});

	if (file.status === 404) {
		return {type: 'not-found'};
	}

	if (file.status !== 200) {
		throw new Error(
			`Expected status code 200 or 404 for file, got ${file.status}`,
		);
	}

	const size = file.headers.get('content-length');

	if (!size) {
		throw new Error('Unexpected error: content-length is null');
	}

	const fetchedAt = Date.now();
	const srcWithTime = addTime ? `${src}?date=${fetchedAt}` : src;

	const fileType = getPreviewFileType(src);

	if (fileType === 'video') {
		const resolution = await getVideoMetadata(srcWithTime);
		return {
			type: 'found',
			size: Number(size),
			dimensions: {width: resolution.width, height: resolution.height},
			fetchedAt,
		};
	}

	if (fileType === 'image') {
		const resolution = await new Promise<AssetMetadata>((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				resolve({
					type: 'found',
					size: Number(size),
					dimensions: {width: img.width, height: img.height},
					fetchedAt,
				});
			};

			img.onerror = () => {
				reject(new Error('Failed to load image'));
			};

			img.src = srcWithTime;
		});
		return resolution;
	}

	return {
		type: 'found',
		dimensions: 'none',
		size: Number(size),
		fetchedAt,
	};
};
