import type {getFolderFiles as original} from '../get-files-in-folder';

export const getFolderFiles: typeof original = () => {
	return [
		{
			filename: 'something',
			size: 0,
		},
	];
};
