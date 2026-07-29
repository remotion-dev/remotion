import type {ImportSpecifier} from '@babel/types';

export const getImportedName = (specifier: ImportSpecifier) => {
	if (specifier.imported.type === 'Identifier') {
		return specifier.imported.name;
	}

	return specifier.imported.value;
};
