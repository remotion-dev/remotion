import fs, {readFileSync, writeFileSync} from 'node:fs';

export type FileChangeEvent =
	| {type: 'created'; content: string; originatorClientId: string | undefined}
	| {type: 'deleted'}
	| {type: 'changed'; content: string; originatorClientId: string | undefined};

type OnChange = (event: FileChangeEvent) => void;

type SharedWatcher = {
	subscribers: Set<OnChange>;
	existedBefore: boolean;
	lastKnownContent: string | null;
	unwatch: () => void;
};

const getRegistryKey = (file: string, existenceOnly: boolean): string =>
	existenceOnly ? `${file}\0existence-only` : file;

export type FileWatcherRegistry = {
	installFileWatcher: (options: {
		file: string;
		onChange: OnChange;
		/**
		 * When true, only created/deleted events are emitted (no reads on change).
		 * Use for binary or very large files (e.g. render output) where subscribers
		 * only need to know whether the path exists.
		 * Pass false when subscribers need content (including `changed` events).
		 */
		existenceOnly: boolean;
	}) => {
		exists: boolean;
		unwatch: () => void;
	};
	writeFileAndNotifyFileWatchers: (
		file: string,
		content: string,
		originatorClientId: string | undefined,
	) => void;
};

export const createFileWatcherRegistry = (): FileWatcherRegistry => {
	const sharedWatchers = new Map<string, SharedWatcher>();

	const _installFileWatcher = ({
		file,
		onChange,
		existenceOnly,
	}: {
		file: string;
		onChange: OnChange;
		existenceOnly: boolean;
	}): {exists: boolean; unwatch: () => void} => {
		const registryKey = getRegistryKey(file, existenceOnly);
		const existing = sharedWatchers.get(registryKey);

		if (existing) {
			existing.subscribers.add(onChange);

			return {
				exists: existing.existedBefore,
				unwatch: () => {
					existing.subscribers.delete(onChange);
					if (existing.subscribers.size === 0) {
						existing.unwatch();
						sharedWatchers.delete(registryKey);
					}
				},
			};
		}

		const existedAtBeginning = fs.existsSync(file);

		const shared: SharedWatcher = {
			subscribers: new Set([onChange]),
			existedBefore: existedAtBeginning,
			lastKnownContent: null,
			unwatch: () => {
				fs.unwatchFile(file, listener);
			},
		};

		const listener = () => {
			const existsNow = fs.existsSync(file);

			let event: FileChangeEvent | null = null;

			if (existenceOnly) {
				if (!shared.existedBefore && existsNow) {
					shared.existedBefore = true;
					event = {
						type: 'created',
						content: '',
						originatorClientId: undefined,
					};
				} else if (shared.existedBefore && !existsNow) {
					shared.existedBefore = false;
					event = {type: 'deleted'};
				}
			} else if (!shared.existedBefore && existsNow) {
				const content = readFileSync(file, 'utf-8');
				shared.existedBefore = true;
				shared.lastKnownContent = content;
				event = {type: 'created', content, originatorClientId: undefined};
			} else if (shared.existedBefore && !existsNow) {
				shared.existedBefore = false;
				shared.lastKnownContent = null;
				event = {type: 'deleted'};
			} else if (existsNow) {
				if (typeof Deno !== 'undefined') {
					return;
				}

				const content = readFileSync(file, 'utf-8');

				if (
					shared.lastKnownContent !== null &&
					content === shared.lastKnownContent
				) {
					return;
				}

				shared.lastKnownContent = content;
				event = {type: 'changed', content, originatorClientId: undefined};
			}

			if (!event) {
				return;
			}

			for (const subscriber of shared.subscribers) {
				subscriber(event);
			}
		};

		fs.watchFile(file, {interval: 100}, listener);
		sharedWatchers.set(registryKey, shared);

		return {
			exists: existedAtBeginning,
			unwatch: () => {
				shared.subscribers.delete(onChange);
				if (shared.subscribers.size === 0) {
					shared.unwatch();
					sharedWatchers.delete(registryKey);
				}
			},
		};
	};

	const _writeFileAndNotifyFileWatchers = (
		file: string,
		content: string,
		originatorClientId: string | undefined,
	) => {
		writeFileSync(file, content);

		const shared = sharedWatchers.get(getRegistryKey(file, false));
		if (!shared) {
			return;
		}

		shared.lastKnownContent = content;
		shared.existedBefore = true;

		for (const subscriber of shared.subscribers) {
			subscriber({type: 'changed', content, originatorClientId});
		}
	};

	return {
		installFileWatcher: _installFileWatcher,
		writeFileAndNotifyFileWatchers: _writeFileAndNotifyFileWatchers,
	};
};

let currentRegistry: FileWatcherRegistry | null = null;

export const setFileWatcherRegistry = (
	registry: FileWatcherRegistry,
): (() => void) => {
	currentRegistry = registry;
	return () => {
		currentRegistry = null;
	};
};

export const getFileWatcherRegistry = (): FileWatcherRegistry => {
	if (!currentRegistry) {
		throw new Error('File watcher registry not initialized');
	}

	return currentRegistry;
};

export const installFileWatcher: FileWatcherRegistry['installFileWatcher'] = (
	options,
) => {
	if (!currentRegistry) {
		return {
			exists: false,
			unwatch: () => {},
		};
	}

	return getFileWatcherRegistry().installFileWatcher(options);
};

export const writeFileAndNotifyFileWatchers: FileWatcherRegistry['writeFileAndNotifyFileWatchers'] =
	(file, content, originatorClientId) => {
		if (!currentRegistry) {
			return;
		}

		getFileWatcherRegistry().writeFileAndNotifyFileWatchers(
			file,
			content,
			originatorClientId,
		);
	};
