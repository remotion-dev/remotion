import type {_InternalTypes} from 'remotion';
import {validateNewFolderName} from './validate-new-folder-name';

export const validateFolderRename = ({
	folders,
	newName,
	originalName,
	parentName,
}: {
	folders: _InternalTypes['TFolder'][];
	newName: string;
	originalName: string;
	parentName: string | null;
}): string | null => {
	if (newName === originalName) {
		return null;
	}

	return validateNewFolderName({folders, newName, parentName});
};
