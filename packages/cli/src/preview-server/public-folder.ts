import {BundlerInternals} from '@remotion/bundler';
import {watch} from 'fs';
import path from 'path';
// eslint-disable-next-line no-restricted-imports
import type {StaticFile} from 'remotion';

let files: StaticFile[] = [];

export const initPublicFolderWatch = ({
	publicDir,
	onUpdate,
}: {
	publicDir: string;
	remotionRoot: string;
	onUpdate: () => void;
}) => {
	fetchFolder({publicDir});
	watchPublicFolder({publicDir, onUpdate});
};

const fetchFolder = ({publicDir}: {publicDir: string}) => {
	files = BundlerInternals.readRecursively({
		folder: '.',
		startPath: publicDir,
	}).map((f) => {
		return {
			...f,
			path: f.path.split(path.sep).join('/'),
		};
	});
};

export const watchPublicFolder = ({
	publicDir,
	onUpdate,
}: {
	publicDir: string;
	onUpdate: () => void;
}) => {
	watch(publicDir, {recursive: true}, () => {
		fetchFolder({publicDir});
		onUpdate();
	});
};

export const getFiles = () => {
	return files;
};
