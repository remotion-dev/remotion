import type {OutputContainer} from '~/seo';

export const getNewName = (name: string, newContainer: OutputContainer) => {
	const parts = name.split('.');

	parts.pop();

	return [...parts, newContainer].join('.');
};
