import type {IsoBaseMediaBox} from '../../containers/iso-base-media/base-media-box';

export type MoofBox = {
	offset: number;
	size: number;
	trafBoxes: IsoBaseMediaBox[];
};

// Note: May be duplicated!
export const precomputedMoofState = () => {
	let moofBoxes: MoofBox[] = [];

	return {
		getMoofBoxes: () => moofBoxes,
		setMoofBoxes: (boxes: MoofBox[]) => {
			moofBoxes = boxes;
		},
	};
};

export const toMoofBox = (box: IsoBaseMediaBox): MoofBox => {
	if (box.type !== 'regular-box') {
		throw new Error('expected regular bpx');
	}

	return {
		offset: box.offset,
		trafBoxes: box.children.filter(
			(c) => c.type === 'regular-box' && c.boxType === 'traf',
		) as IsoBaseMediaBox[],
		size: box.boxSize,
	};
};

export const deduplicateMoofBoxesByOffset = (moofBoxes: MoofBox[]) => {
	return moofBoxes.filter(
		(m, i, arr) => i === arr.findIndex((t) => t.offset === m.offset),
	);
};
