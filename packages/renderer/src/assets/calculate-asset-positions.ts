import type {AudioOrVideoAsset, TRenderAsset} from 'remotion/no-react';
import {onlyAudioAndVideoAssets} from '../filter-asset-types';
import {resolveAssetSrc} from '../resolve-asset-src';
import {convertAssetToFlattenedVolume} from './flatten-volume-array';
import type {Assets, MediaAsset, UnsafeAsset} from './types';
import {uncompressMediaAsset} from './types';

const deduplicateAssets = (
	renderAssets: TRenderAsset[],
): AudioOrVideoAsset[] => {
	const onlyAudioAndVideo = onlyAudioAndVideoAssets(renderAssets);
	const seenIds = new Set<string>();
	const deduplicated: AudioOrVideoAsset[] = [];

	for (const renderAsset of onlyAudioAndVideo) {
		if (!seenIds.has(renderAsset.id)) {
			seenIds.add(renderAsset.id);
			deduplicated.push(renderAsset);
		}
	}

	return deduplicated;
};

const indexUncompressedAssets = (renderAssets: AudioOrVideoAsset[]) => {
	const referencedAssets = new Set<string>();
	for (const renderAsset of renderAssets) {
		if (renderAsset.src.startsWith('same-as')) {
			referencedAssets.add(renderAsset.src);
		}
	}

	const assetsByReference = new Map<string, AudioOrVideoAsset>();

	for (const renderAsset of renderAssets) {
		if (referencedAssets.size === 0) {
			break;
		}

		if (renderAsset.src.startsWith('same-as')) {
			continue;
		}

		const reference = `same-as-${renderAsset.id}-${renderAsset.frame}`;
		if (referencedAssets.has(reference)) {
			assetsByReference.set(reference, renderAsset);
			referencedAssets.delete(reference);
		}
	}

	return assetsByReference;
};

export const calculateAssetPositions = (
	frames: AudioOrVideoAsset[][],
): Assets => {
	const assets: UnsafeAsset[] = [];
	// Assets that have started but not yet ended, keyed by asset id.
	// Since assets are deduplicated by id within a frame, at most one
	// asset per id is open at a time.
	const openAssets = new Map<string, UnsafeAsset>();

	const flattened = frames.flat(1);
	const uncompressedAssets = indexUncompressedAssets(flattened);
	for (let frame = 0; frame < frames.length; frame++) {
		const current = deduplicateAssets(frames[frame]);
		const currentIds = new Set(current.map((a) => a.id));

		for (const [id, openAsset] of openAssets) {
			if (!currentIds.has(id)) {
				// The asset was last present on the previous frame.
				// Duration calculation:
				// start 0, present for frames 0-59, gone at frame 60:
				// 60 - 0 ==> 60 frames duration
				openAsset.duration = frame - openAsset.startInVideo;
				openAssets.delete(id);
			}
		}

		for (const asset of current) {
			let openAsset = openAssets.get(asset.id);
			if (openAsset === undefined) {
				const uncompressedAsset = uncompressedAssets.get(asset.src);
				openAsset = {
					src: resolveAssetSrc(
						uncompressMediaAsset(
							uncompressedAsset ? [uncompressedAsset] : flattened,
							asset,
						).src,
					),
					type: asset.type,
					duration: null,
					id: asset.id,
					startInVideo: frame,
					trimLeft: asset.mediaFrame,
					volume: [],
					playbackRate: asset.playbackRate,
					toneFrequency: asset.toneFrequency,
					audioStartFrame: asset.audioStartFrame,
					audioStreamIndex: asset.audioStreamIndex,
				};
				assets.push(openAsset);
				openAssets.set(asset.id, openAsset);
			}

			openAsset.volume.push(asset.volume);
		}
	}

	// Assets that lasted until the end of the video.
	for (const openAsset of openAssets.values()) {
		openAsset.duration = frames.length - openAsset.startInVideo;
	}

	for (const asset of assets) {
		if (asset.duration === null) {
			throw new Error('duration is unexpectedly null');
		}
	}

	return (assets as MediaAsset[]).map((a) => convertAssetToFlattenedVolume(a));
};
