import {existsSync, watch, type FSWatcher} from 'node:fs';
import path from 'node:path';
import {BundlerInternals} from '@remotion/bundler';
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
	let watchedPublicDir: string | null = publicDir;
	let watcher: FSWatcher | null = null;

	const watchPublicFolder = (dir: string): FSWatcher => {
		if (!existsSync(dir)) {
			const parentDir = path.dirname(dir);
			const parentWatcher = watch(parentDir, {}, () => {
				if (watchedPublicDir !== dir || !existsSync(dir)) {
					return;
				}

				parentWatcher.close();
				watcher = watchPublicFolder(dir);
				fetchFolder({publicDir: dir, staticHash});
				onUpdate();
			});
			return parentWatcher;
		}

		// Known bug: If whole public folder is deleted, this will not be called on macOS.
		// This is not severe, so a wontfix for now.
		return watch(dir, {recursive: envSupportsFsRecursive()}, () => {
			if (watchedPublicDir !== dir) {
				return;
			}

			fetchFolder({publicDir: dir, staticHash});
			onUpdate();
		});
	};

	fetchFolder({publicDir, staticHash});
	watcher = watchPublicFolder(publicDir);

	return {
		updatePublicFolderWatch: (newPublicDir: string) => {
			if (newPublicDir === watchedPublicDir) {
				return;
			}

			watcher?.close();
			watchedPublicDir = newPublicDir;
			fetchFolder({publicDir: newPublicDir, staticHash});
			watcher = watchPublicFolder(newPublicDir);
			onUpdate();
		},
		close: () => {
			watcher?.close();
			watcher = null;
			watchedPublicDir = null;
		},
	};
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

export const getFiles = () => {
	return files;
};
