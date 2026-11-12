import type {StudioElementLibrary} from '@remotion/studio-shared';

export const REMOTION_ELEMENTS_URL = 'https://www.remotion.dev/elements';
export const THIRD_PARTY_ELEMENTS_URL =
	'https://www.remotion.dev/elements/libraries';

export const isElementLibraryOrderApplied = (
	order: readonly string[],
	libraries: readonly StudioElementLibrary[],
): boolean => {
	const urls = libraries.map((library) => library.url);
	const expected = order.filter((url) => urls.includes(url));
	const actual = urls.filter((url) => order.includes(url));
	return (
		actual.length === expected.length &&
		actual.every((url, index) => url === expected[index])
	);
};
