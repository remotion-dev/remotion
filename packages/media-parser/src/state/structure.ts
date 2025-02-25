import type {Structure} from '../parse-result';

export const structureState = () => {
	let structure: Structure | null = null;

	const getStructure = () => {
		if (structure === null) {
			throw new Error('Expected structure');
		}

		return structure;
	};

	return {
		getStructureOrNull: () => {
			return structure;
		},
		getStructure,
		setStructure: (value: Structure) => {
			structure = value;
		},
		getFlacStructure: () => {
			const struc = getStructure();
			if (struc.type !== 'flac') {
				throw new Error('Invalid structure type');
			}

			return struc;
		},
		getIsoStructure: () => {
			const struc = getStructure();
			if (struc.type !== 'iso-base-media') {
				throw new Error('Invalid structure type');
			}

			return struc;
		},
		getMp3Structure: () => {
			const struc = getStructure();
			if (struc.type !== 'mp3') {
				throw new Error('Invalid structure type');
			}

			return struc;
		},
		getM3uStructure: () => {
			const struc = getStructure();
			if (struc.type !== 'm3u') {
				throw new Error('Invalid structure type');
			}

			return struc;
		},
		getRiffStructure: () => {
			const struc = getStructure();
			if (struc.type !== 'riff') {
				throw new Error('Invalid structure type');
			}

			return struc;
		},
		getTsStructure: () => {
			const struc = getStructure();
			if (struc.type !== 'transport-stream') {
				throw new Error('Invalid structure type');
			}

			return struc;
		},
		getWavStructure: () => {
			const struc = getStructure();
			if (struc.type !== 'wav') {
				throw new Error('Invalid structure type');
			}

			return struc;
		},
		getMatroskaStructure: () => {
			const struc = getStructure();
			if (struc.type !== 'matroska') {
				throw new Error('Invalid structure type');
			}

			return struc;
		},
	};
};

export type StructureState = ReturnType<typeof structureState>;
