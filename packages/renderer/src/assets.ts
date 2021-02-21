type AssetMetadata = {
	type: 'audio';
	src: string;
};

type Asset = AssetMetadata & {
	from: number;
	duration?: number;
};

const areEqual = (a: AssetMetadata, b: AssetMetadata) => {
	return a.type === b.type && a.src === b.src;
};

export const calculateAssetsPosition = (frames: AssetMetadata[][]) => {
	const assets: Asset[] = [];

	for (let frame = 0; frame < frames.length; frame++) {
		const prev = (frames[frame - 1] ?? []).slice();
		const current = frames[frame];
		const next = (frames[frame + 1] ?? []).slice();

		for (const asset of current) {
			const findFrom = (target: AssetMetadata[]) => {
				const index = target.findIndex((a) => areEqual(a, asset));
				if (index === -1) {
					return false;
				} else {
					target.splice(index, 1);
					return true;
				}
			};

			if (!findFrom(prev)) {
				assets.push({...asset, from: frame});
			}

			if (!findFrom(next)) {
				const found = assets.find(
					(a) => a.duration == null && areEqual(a, asset)
				);
				if (!found) throw new Error('something wrong');
				found.duration = frame - found.from - 1;
			}
		}
	}

	return assets;
};
