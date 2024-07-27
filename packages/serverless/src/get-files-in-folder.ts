export type FileNameAndSize = {
	filename: string;
	size: number;
};

export type GetFolderFiles = (folder: string) => FileNameAndSize[];
