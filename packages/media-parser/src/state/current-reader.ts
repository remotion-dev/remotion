import type {Reader} from '../readers/reader';

export const currentReader = (initialReader: Reader) => {
	let current = initialReader;
	return {
		getCurrent: () => current,
		setCurrent: (newReader: Reader) => {
			current = newReader;
		},
	};
};

export type CurrentReader = ReturnType<typeof currentReader>;
