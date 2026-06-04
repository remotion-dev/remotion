import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';

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
	if (!Internals.isFolderNameValid(newName)) {
		return Internals.invalidFolderNameErrorMessage;
	}

	if (newName === originalName) {
		return null;
	}

	if (
		folders.find((folder) => {
			return folder.name === newName && folder.parent === parentName;
		})
	) {
		return `A folder with that name already exists.`;
	}

	return null;
};
