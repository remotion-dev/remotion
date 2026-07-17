import {existsSync, watch, type FSWatcher} from 'node:fs';
import path from 'node:path';
import {BundlerInternals} from '@remotion/bundler';
import type {StaticFile} from 'remotion';
import {envSupportsFsRecursive} from './env-supports-fs-recursive';

let files: StaticFile[] = [];
let activeWatcher: FSWatcher | null = null;
let watchedPublicDir: string | null = null;
let watchStaticHash: string | null = null;
let watchOnUpdate: (() => void) | null = null;
let getPublicDirFn: (() => string) | null = null;

export const initPublicFolderWatch = ({
	getPublicDir,
	onUpdate,
	staticHash,
}: {
	getPublicDir: () => string;
	remotionRoot: string;
	onUpdate: () => void;
	staticHash: string;
}) => {
	getPublicDirFn = getPublicDir;
	watchOnUpdate = onUpdate;
	watchStaticHash = staticHash;
	syncPublicFolderWatch();
};

export const syncPublicFolderWatch = () => {
	if (!getPublicDirFn || !watchOnUpdate || !watchStaticHash) {
		return;
	}

	const publicDir = getPublicDirFn();
	if (publicDir === watchedPublicDir && activeWatcher) {
		return;
	}

	const previousDir = watchedPublicDir;
	closePublicFolderWatch();
	watchedPublicDir = publicDir;
	fetchFolder({publicDir, staticHash: watchStaticHash});
	activeWatcher = watchPublicFolder({
		publicDir,
		onUpdate: watchOnUpdate,
		staticHash: watchStaticHash,
		setActiveWatcher: (watcher) => {
			activeWatcher = watcher;
		},
	});

	if (previousDir !== null && previousDir !== publicDir) {
		watchOnUpdate();
	}
};

const closePublicFolderWatch = () => {
	if (activeWatcher) {
		activeWatcher.close();
		activeWatcher = null;
	}

	watchedPublicDir = null;
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
	setActiveWatcher,
}: {
	publicDir: string;
	onUpdate: () => void;
	staticHash: string;
	setActiveWatcher: (watcher: FSWatcher) => void;
}): FSWatcher => {
	if (!existsSync(publicDir)) {
		const parentDir = path.dirname(publicDir);
		const onDirChange = () => {
			if (existsSync(publicDir)) {
				watcher.close();
				const nextWatcher = watchPublicFolder({
					publicDir,
					onUpdate,
					staticHash,
					setActiveWatcher,
				});
				setActiveWatcher(nextWatcher);
				onUpdate();
			}
		};

		const watcher = watch(parentDir, {}, onDirChange);
		return watcher;
	}

	// Known bug: If whole public folder is deleted, this will not be called on macOS.
	// This is not severe, so a wontfix for now.
	return watch(publicDir, {recursive: envSupportsFsRecursive()}, () => {
		fetchFolder({publicDir, staticHash});
		onUpdate();
	});
};

export const getFiles = () => {
	return files;
};

export const resetPublicFolderWatchForTests = () => {
	closePublicFolderWatch();
	files = [];
	watchStaticHash = null;
	watchOnUpdate = null;
	getPublicDirFn = null;
};
