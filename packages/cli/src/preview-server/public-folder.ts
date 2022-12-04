import {watch} from 'fs';
import type {StaticFile} from './get-files-in-public-folder';
import {getFilesInPublicFolder} from './get-files-in-public-folder';
import {writeFilesDefinitionFile} from './write-files-definition-file';

let files: StaticFile[] = [];

export const initPublicFolderWatch = ({
	publicDir,
	remotionRoot,
}: {
	publicDir: string;
	remotionRoot: string;
}) => {
	fetchFolder({publicDir, remotionRoot});
	watchPublicFolder({publicDir, remotionRoot});
};

const fetchFolder = ({
	publicDir,
	remotionRoot,
}: {
	publicDir: string;
	remotionRoot: string;
}) => {
	files = getFilesInPublicFolder(publicDir);
	writeFilesDefinitionFile(files, remotionRoot);
};

export const watchPublicFolder = ({
	publicDir,
	remotionRoot,
}: {
	publicDir: string;
	remotionRoot: string;
}) => {
	watch(publicDir, {recursive: true}, () => {
		fetchFolder({publicDir, remotionRoot});
	});
};

export const getFiles = () => {
	return files;
};
