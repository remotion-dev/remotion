import type {OutputFormat} from 'mediabunny';

export const getNewName = (name: string, newContainer: OutputFormat) => {
	const parts = name.split('.');

	parts.pop();

	return [...parts].join('.') + newContainer.fileExtension;
};
