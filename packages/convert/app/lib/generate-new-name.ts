export type Container = 'webm';

export const getNewName = (name: string, newContainer: Container) => {
	const parts = name.split('.');

	parts.pop();

	return [...parts, newContainer].join('.');
};
