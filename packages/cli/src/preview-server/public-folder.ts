import {BundlerInternals} from '@remotion/bundler';
import {existsSync, watch} from 'fs';
import path from 'path';
import type {StaticFile} from 'remotion';
import {envSupportsFsRecursive} from './env-supports-fs-recursive';

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

export const fetchFolder = ({
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
		limit: 1000,
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
	if (!existsSync(publicDir)) {
		const parentDir = path.dirname(publicDir);
		const onDirChange = () => {
			if (existsSync(publicDir)) {
				watchPublicFolder({
					publicDir,
					onUpdate,
					staticHash,
				});
				watcher.close();
			}
		};

		const watcher = watch(parentDir, {}, onDirChange);
		return;
	}

	watch(publicDir, {recursive: envSupportsFsRecursive()}, () => {
		fetchFolder({publicDir, staticHash});
		onUpdate();
	});
};

export const getFiles = () => {
	return files;
};
