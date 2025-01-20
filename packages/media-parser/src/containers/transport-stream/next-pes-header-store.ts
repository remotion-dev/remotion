import type {PacketPes} from './parse-pes';

export const makeNextPesHeaderStore = () => {
	let nextPesHeader: PacketPes | null = null;

	return {
		setNextPesHeader: (pesHeader: PacketPes) => {
			nextPesHeader = pesHeader;
		},
		getNextPesHeader: () => {
			if (!nextPesHeader) {
				throw new Error('No next PES header found');
			}

			return nextPesHeader;
		},
	};
};

export type NextPesHeaderStore = ReturnType<typeof makeNextPesHeaderStore>;
