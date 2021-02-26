import {TAsset} from 'remotion';

type UnsafeAsset = TAsset & {
	startInVideo: number;
	duration: number | null;
};

type MediaAsset = Omit<UnsafeAsset, 'duration'> & {
	duration: number;
};

export type Assets = MediaAsset[];

const areEqual = (a: TAsset, b: TAsset) => {
	return a.type === b.type && a.src === b.src;
};

const findFrom = (target: TAsset[], asset: TAsset) => {
	const index = target.findIndex((a) => areEqual(a, asset));
	if (index === -1) {
		return false;
	} else {
		target.splice(index, 1);
		return true;
	}
};

export const calculateAssetsPosition = (frames: TAsset[][]): Assets => {
	const assets: UnsafeAsset[] = [];

	for (let frame = 0; frame < frames.length; frame++) {
		const prev = (frames[frame - 1] ?? []).slice();
		const current = frames[frame];
		const next = (frames[frame + 1] ?? []).slice();

		for (const asset of current) {
			if (!findFrom(prev, asset)) {
				assets.push({
					...asset,
					duration: null,
					startInVideo: frame,
				});
			}

			if (!findFrom(next, asset)) {
				const found = assets.find(
					(a) => a.duration === null && areEqual(a, asset)
				);
				if (!found) throw new Error('something wrong');
				found.duration = frame - found.startInVideo - 1;
			}
		}
	}

	for (const asset of assets) {
		if (asset.duration === null) {
			throw new Error('duration is unexpectedly null');
		}
	}
	return assets as MediaAsset[];
};
