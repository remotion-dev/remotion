import {TAsset} from 'remotion';
import {splitAssetsIntoSegments} from './split-assets-into-segments';
import {Assets, MediaAsset, UnsafeAsset} from './types';

const areEqual = (a: TAsset | UnsafeAsset, b: TAsset) => {
	return a.id === b.id;
};

const findFrom = (target: TAsset[], asset: TAsset) => {
	const index = target.findIndex((a) => areEqual(a, asset));
	if (index === -1) {
		return false;
	}

	target.splice(index, 1);
	return true;
};

export const calculateAssetPositions = (frames: TAsset[][]): Assets => {
	const assets: UnsafeAsset[] = [];

	for (let frame = 0; frame < frames.length; frame++) {
		const prev = (frames[frame - 1] ?? []).slice();
		const current = frames[frame];
		const next = (frames[frame + 1] ?? []).slice();

		for (const asset of current) {
			if (!findFrom(prev, asset)) {
				assets.push({
					src: asset.src,
					type: asset.type,
					duration: null,
					id: asset.id,
					startInVideo: frame,
					trimLeft: asset.mediaFrame,
					volume: [],
					isRemote: asset.isRemote,
				});
			}

			const found = assets.find(
				(a) => a.duration === null && areEqual(a, asset)
			);
			if (!found) throw new Error('something wrong');
			if (!findFrom(next, asset)) {
				// Duration calculation:
				// start 0, range 0-59:
				// 59 - 0 + 1 ==> 60 frames duration
				found.duration = frame - found.startInVideo + 1;
			}

			found.volume = [...found.volume, asset.volume];
		}
	}

	for (const asset of assets) {
		if (asset.duration === null) {
			throw new Error('duration is unexpectedly null');
		}
	}

	return splitAssetsIntoSegments({
		assets: assets as MediaAsset[],
		duration: frames.length,
	});
};
