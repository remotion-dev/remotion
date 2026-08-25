import type {CanvasContent} from 'remotion';
import {staticFile} from 'remotion';
import {addAssetCacheBust} from './add-asset-cache-bust';
import {getPreviewFileType} from './get-preview-file-type';
import type {Dimensions} from './is-current-selected-still';
import {getMediaMetadata, type MediaMetadata} from './use-media-metadata';

export const remotion_outputsBase = window.remotion_staticBase.replace(
	'static',
	'outputs',
);

const getSrcFromCanvasContent = (
	canvasContent: CanvasContent & {type: 'asset' | 'output'},
) => {
	if (canvasContent.type === 'asset') {
		return staticFile(canvasContent.asset);
	}

	return remotion_outputsBase + canvasContent.path;
};

export type AssetMetadata =
	| {
			type: 'not-found';
	  }
	| {
			type: 'metadata-error';
			error: Error;
	  }
	| {
			type: 'found';
			size: number;
			dimensions: Dimensions | 'none' | null;
			fetchedAt: number;
			mediaMetadata: MediaMetadata | null;
	  };

export const getAssetPreviewMetadata = ({
	canvasContent,
	metadata,
}: {
	canvasContent: CanvasContent;
	metadata: AssetMetadata;
}) => {
	if (
		canvasContent.type !== 'asset' ||
		metadata.type !== 'found' ||
		metadata.mediaMetadata === null ||
		!Number.isFinite(metadata.mediaMetadata.duration) ||
		metadata.mediaMetadata.duration <= 0
	) {
		return null;
	}

	const fileType = getPreviewFileType(canvasContent.asset);
	if (fileType !== 'audio' && fileType !== 'video') {
		return null;
	}

	const {dimensions} = metadata;
	if (dimensions === null || dimensions === 'none') {
		return null;
	}

	const detectedFps = metadata.mediaMetadata.fps;
	const fps =
		detectedFps !== null && Number.isFinite(detectedFps) && detectedFps > 0
			? detectedFps
			: 30;

	return {
		asset: canvasContent.asset,
		width: dimensions.width,
		height: dimensions.height,
		fps,
		durationInFrames: Math.max(
			1,
			Math.ceil(metadata.mediaMetadata.duration * fps),
		),
		props: {},
		defaultCodec: null,
		defaultOutName: null,
		defaultVideoImageFormat: null,
		defaultPixelFormat: null,
		defaultProResProfile: null,
		defaultSampleRate: metadata.mediaMetadata.sampleRate,
	};
};

export const getAssetMetadata = async (
	canvasContent: CanvasContent,
	addTime: boolean,
): Promise<AssetMetadata> => {
	if (canvasContent.type === 'output-blob') {
		return {
			type: 'found',
			size: canvasContent.sizeInBytes,
			dimensions: {width: canvasContent.width, height: canvasContent.height},
			fetchedAt: Date.now(),
			mediaMetadata: null,
		};
	}

	if (canvasContent.type === 'composition') {
		throw new Error('cannot get dimensions for composition');
	}

	try {
		const src = getSrcFromCanvasContent(canvasContent);
		const listedStaticFile =
			canvasContent.type === 'asset'
				? window.remotion_staticFiles.find(
						(file) => file.name === canvasContent.asset && file.src === src,
					)
				: null;
		let size = listedStaticFile?.sizeInBytes ?? null;

		if (size === null) {
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

			const contentLength = file.headers.get('content-length');

			if (!contentLength) {
				throw new Error('Unexpected error: content-length is null');
			}

			size = Number(contentLength);
		}

		const fetchedAt = Date.now();
		const srcWithTime = addTime ? addAssetCacheBust({fetchedAt, src}) : src;

		const fileType = getPreviewFileType(src);

		if (fileType === 'video' || fileType === 'audio') {
			const mediaMetadata = await getMediaMetadata(srcWithTime);
			if (mediaMetadata === null) {
				throw new Error(`Could not read media metadata for ${src}`);
			}

			const width = mediaMetadata.width ?? 1920;
			const height = mediaMetadata.height ?? 1080;
			return {
				type: 'found',
				size,
				dimensions: {width, height},
				fetchedAt,
				mediaMetadata,
			};
		}

		if (fileType === 'image') {
			const resolution = await new Promise<AssetMetadata>((resolve, reject) => {
				const img = new Image();
				img.onload = () => {
					resolve({
						type: 'found',
						size,
						dimensions: {width: img.width, height: img.height},
						fetchedAt,
						mediaMetadata: null,
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
			size,
			fetchedAt,
			mediaMetadata: null,
		};
	} catch (err) {
		return {
			type: 'metadata-error',
			error: err instanceof Error ? err : new Error(String(err)),
		};
	}
};
