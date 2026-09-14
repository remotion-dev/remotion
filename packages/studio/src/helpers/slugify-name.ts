import {Internals} from 'remotion';

export const slugifyName = (name: string): string => {
	return Internals.isFolderNameValid(name)
		? name
		: name
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.replace(/[^a-zA-Z0-9\u4E00-\u9FFF-]+/g, '-')
				.replace(/^-+|-+$/g, '');
};
