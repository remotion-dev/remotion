import {BundlerInternals} from '@remotion/bundler';
import {existsSync, watch} from 'node:fs';
import path from 'node:path';
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
		limit: 10000,
	}).map((f) => {
		return {
			...f,
			name: f.name.split(path.sep).join('/'),
		};
	});
};

const watchPublicFolder = ({
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
				onUpdate();
				watcher.close();
			}
		};

		const watcher = watch(parentDir, {}, onDirChange);
		return;
	}

	// Known bug: If whole public folder is deleted, this will not be called on macOS.
	// This is not severe, so a wontfix for now.
	watch(publicDir, {recursive: envSupportsFsRecursive()}, () => {
		fetchFolder({publicDir, staticHash});
		onUpdate();
	});
};

export const getFiles = () => {
	return files;
};
