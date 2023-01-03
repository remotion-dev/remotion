import {BundlerInternals} from '@remotion/bundler';
import {watch} from 'fs';
import path from 'path';
// eslint-disable-next-line no-restricted-imports
import type {StaticFile} from 'remotion';

let files: StaticFile[] = [];

export const initPublicFolderWatch = ({
	publicDir,
	onUpdate,
	staticHash,
}: {
	publicDir: string;
	remotionRoot: string;
	onUpdate: () => void;
	staticHash: string;
}) => {
	fetchFolder({publicDir, staticHash});
	watchPublicFolder({publicDir, onUpdate, staticHash});
};

const fetchFolder = ({
	publicDir,
	staticHash,
}: {
	publicDir: string;
	staticHash: string;
}) => {
	files = BundlerInternals.readRecursively({
		folder: '.',
		startPath: publicDir,
		staticHash,
	}).map((f) => {
		return {
			...f,
			name: f.name.split(path.sep).join('/'),
		};
	});
};

export const watchPublicFolder = ({
	publicDir,
	onUpdate,
	staticHash,
}: {
	publicDir: string;
	onUpdate: () => void;
	staticHash: string;
}) => {
	watch(publicDir, {recursive: true}, () => {
		fetchFolder({publicDir, staticHash});
		onUpdate();
	});
};

export const getFiles = () => {
	return files;
};
