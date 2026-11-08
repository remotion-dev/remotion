import {randomUUID} from 'node:crypto';
import fs, {readFileSync, writeFileSync} from 'node:fs';
import type {SourceFileVersion} from '@remotion/studio-shared';
import {validateSourceMutation} from './preview-server/source-mutation-guard';
import {
	notifyBundlerOfFileChange,
	prepareBundlerForFileWrite,
} from './preview-server/watch-ignore-next-change';

export type FileChangeMetadata = {
	skipSequencePropsUpdate: boolean;
};

type WriteFileAndNotifyFileWatchersOptions = {
	file: string;
	content: string;
	originatorClientId: string | undefined;
	metadata: FileChangeMetadata | null;
};

export type FileChangeEvent =
	| {
			type: 'created';
			content: string;
			originatorClientId: string | undefined;
			sourceVersion: SourceFileVersion | null;
	  }
	| {type: 'deleted'}
	| {
			type: 'changed';
			content: string;
			originatorClientId: string | undefined;
			skipSequencePropsUpdate: boolean;
			sourceVersion: SourceFileVersion | null;
	  };

type OnChange = (event: FileChangeEvent) => void;

const sourceWriteListeners = new Set<
	(file: string, contents: string) => void
>();
const externalSourceListeners = new Set<
	(file: string, version: SourceFileVersion) => void
>();
export const subscribeToExternalSourceChanges = (
	listener: (file: string, version: SourceFileVersion) => void,
) => {
	externalSourceListeners.add(listener);
	return () => externalSourceListeners.delete(listener);
};

export const subscribeToStudioSourceWrites = (
	listener: (file: string, contents: string) => void,
) => {
	sourceWriteListeners.add(listener);
	return () => sourceWriteListeners.delete(listener);
};

type SharedWatcher = {
	subscribers: Set<OnChange>;
	existedBefore: boolean;
	lastKnownContent: string | null;
	unwatch: () => void;
};

const getRegistryKey = (file: string, existenceOnly: boolean): string =>
	existenceOnly ? `${file}\0existence-only` : file;

export type FileWatcherRegistry = {
	readonly sourceVersionSessionId: string;
	getExternalSourceRevision: (file: string) => number;
	getExternalSourceRevisions: () => Record<string, number>;
	recordSourceWrite: (file: string, contents: string | null) => void;
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
		options: WriteFileAndNotifyFileWatchersOptions,
	) => SourceFileVersion | null;
};

export const createFileWatcherRegistry = (): FileWatcherRegistry => {
	const sharedWatchers = new Map<string, SharedWatcher>();
	const sessionId = randomUUID();
	let revision = 0;
	const nextSourceVersion = (): SourceFileVersion => ({
		sessionId,
		revision: ++revision,
	});
	const sourceStates = new Map<
		string,
		{contents: string | null; externalRevision: number}
	>();
	const getExternalSourceRevision = (file: string) => {
		let contents: string | null;
		try {
			contents = readFileSync(file, 'utf8');
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
			contents = null;
		}

		const previous = sourceStates.get(file);
		if (!previous) {
			sourceStates.set(file, {contents, externalRevision: 0});
			return 0;
		}

		if (previous.contents !== contents) {
			const version = nextSourceVersion();
			sourceStates.set(file, {contents, externalRevision: version.revision});
			for (const listener of externalSourceListeners) listener(file, version);
			return version.revision;
		}

		return previous.externalRevision;
	};

	const recordSourceWrite = (file: string, contents: string | null) => {
		sourceStates.set(file, {
			contents,
			externalRevision: sourceStates.get(file)?.externalRevision ?? 0,
		});
	};

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
		if (!existenceOnly) getExternalSourceRevision(file);
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
			if (!existenceOnly) getExternalSourceRevision(file);
			const existsNow = fs.existsSync(file);

			let event: FileChangeEvent | null = null;

			if (existenceOnly) {
				if (!shared.existedBefore && existsNow) {
					shared.existedBefore = true;
					event = {
						type: 'created',
						content: '',
						originatorClientId: undefined,
						sourceVersion: null,
					};
				} else if (shared.existedBefore && !existsNow) {
					shared.existedBefore = false;
					event = {type: 'deleted'};
				}
			} else if (!shared.existedBefore && existsNow) {
				const content = readFileSync(file, 'utf-8');
				shared.existedBefore = true;
				shared.lastKnownContent = content;
				event = {
					type: 'created',
					content,
					originatorClientId: undefined,
					sourceVersion: nextSourceVersion(),
				};
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
				event = {
					type: 'changed',
					content,
					originatorClientId: undefined,
					skipSequencePropsUpdate: false,
					sourceVersion: nextSourceVersion(),
				};
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

	const _writeFileAndNotifyFileWatchers = ({
		file,
		content,
		originatorClientId,
		metadata,
	}: WriteFileAndNotifyFileWatchersOptions) => {
		validateSourceMutation();
		prepareBundlerForFileWrite(file, content);
		writeFileSync(file, content);
		recordSourceWrite(file, content);
		const sourceVersion = nextSourceVersion();
		for (const listener of sourceWriteListeners) listener(file, content);
		notifyBundlerOfFileChange(file, content);

		const shared = sharedWatchers.get(getRegistryKey(file, false));
		if (!shared) {
			return sourceVersion;
		}

		shared.lastKnownContent = content;
		shared.existedBefore = true;

		for (const subscriber of shared.subscribers) {
			subscriber({
				type: 'changed',
				content,
				originatorClientId,
				skipSequencePropsUpdate: metadata?.skipSequencePropsUpdate ?? false,
				sourceVersion,
			});
		}

		return sourceVersion;
	};

	return {
		sourceVersionSessionId: sessionId,
		getExternalSourceRevision,
		getExternalSourceRevisions: () =>
			Object.fromEntries(
				[...sourceStates]
					.filter(([, state]) => state.externalRevision > 0)
					.map(([file, state]) => [file, state.externalRevision]),
			),
		recordSourceWrite,
		installFileWatcher: _installFileWatcher,
		writeFileAndNotifyFileWatchers: _writeFileAndNotifyFileWatchers,
	};
};

let currentRegistry: FileWatcherRegistry | null = null;

export const getSourceVersionSessionId = (): string | null =>
	currentRegistry?.sourceVersionSessionId ?? null;

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
	(options) => {
		if (!currentRegistry) {
			return null;
		}

		return getFileWatcherRegistry().writeFileAndNotifyFileWatchers(options);
	};
