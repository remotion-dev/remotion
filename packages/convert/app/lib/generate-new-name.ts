import type {ConvertMediaContainer} from '@remotion/webcodecs';

export const getNewName = (
	name: string,
	newContainer: ConvertMediaContainer,
) => {
	const parts = name.split('.');

	parts.pop();

	return [...parts, newContainer].join('.');
};
