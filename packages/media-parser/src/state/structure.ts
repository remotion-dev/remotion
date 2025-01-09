import type {Structure} from '../parse-result';

export const structureState = () => {
	let structure: Structure | null = null;

	return {
		getStructureOrNull: () => {
			return structure;
		},
		getStructure: () => {
			if (structure === null) {
				throw new Error('Expected structure');
			}

			return structure;
		},
		setStructure: (value: Structure) => {
			structure = value;
		},
	};
};

export type StructureState = ReturnType<typeof structureState>;
