// Webpack plugin that suppresses the next file change for dynamically specified files.
// Used to prevent a full webpack rebuild when the studio writes to a watched file
// (e.g. updating default props). On ignoreNextChange(), the current file and directory
// timestamps are snapshotted. When watchpack fires the aggregated callback, the old
// timestamps are restored, the file is removed from changedFiles, and the original
// callback is skipped (which would trigger _invalidate → compile). The watchpack
// listeners are re-registered and unpaused so subsequent real changes still work.
import path from 'node:path';
import type {Compiler} from 'webpack';

type TimeInfoEntry = {
	safeTime: number;
	timestamp?: number;
	accuracy?: number;
} | null;

type WatchCallback = (
	err: null | Error,
	fileTimestamps?: Map<string, TimeInfoEntry>,
	dirTimestamps?: Map<string, TimeInfoEntry>,
	changedFiles?: Set<string>,
	removedFiles?: Set<string>,
) => void;

type CallbackUndelayed = (fileName: string, changeTime: number) => void;

type Watcher = {
	close: () => void;
	pause: () => void;
	getAggregatedRemovals?: () => Set<string>;
	getAggregatedChanges?: () => Set<string>;
	getFileTimeInfoEntries: () => Map<string, TimeInfoEntry>;
	getContextTimeInfoEntries: () => Map<string, TimeInfoEntry>;
	getInfo?: () => {
		changes: Set<string>;
		removals: Set<string>;
		fileTimeInfoEntries: Map<string, TimeInfoEntry>;
		contextTimeInfoEntries: Map<string, TimeInfoEntry>;
	};
};

// NodeWatchFileSystem has a .watcher (Watchpack) with EventEmitter methods
type NodeWatchFileSystem = {
	watcher: {
		once: (event: string, listener: (...args: unknown[]) => void) => void;
		pause: () => void;
		paused: boolean;
		aggregatedChanges: Set<string>;
		aggregatedRemovals: Set<string>;
	};
	inputFileSystem: {
		purge?: (item: string) => void;
	};
	watch: (
		files: Iterable<string>,
		directories: Iterable<string>,
		missing: Iterable<string>,
		startTime: number,
		options: Record<string, unknown>,
		callback: WatchCallback,
		callbackUndelayed: CallbackUndelayed,
	) => Watcher;
};

type TraceLogFn = (...args: Parameters<typeof console.log>) => void;

export class WatchIgnoreNextChangePlugin {
	private filesToIgnore = new Set<string>();
	private dirsToIgnore = new Set<string>();
	private snapshotFileTimestamps = new Map<string, TimeInfoEntry>();
	private snapshotDirTimestamps = new Map<string, TimeInfoEntry>();
	private suppressedFilesHistory = new Set<string>();
	private currentWatcher: Watcher | null = null;
	private trace: TraceLogFn;

	constructor(trace: TraceLogFn) {
		this.trace = trace;
	}

	ignoreNextChange(file: string): void {
		this.filesToIgnore.add(file);
		const dir = path.dirname(file);
		this.dirsToIgnore.add(dir);

		// Snapshot current timestamps from the watcher BEFORE the file is written
		if (this.currentWatcher?.getInfo) {
			const info = this.currentWatcher.getInfo();
			const fileTs = info.fileTimeInfoEntries.get(file);
			if (fileTs !== undefined) {
				this.snapshotFileTimestamps.set(file, fileTs);
			}

			const dirTs = info.contextTimeInfoEntries.get(dir);
			if (dirTs !== undefined) {
				this.snapshotDirTimestamps.set(dir, dirTs);
			}

			// Also snapshot ancestor directories — watchpack may report them
			// as changed alongside the file itself.
			let ancestor = path.dirname(dir);
			while (ancestor !== path.dirname(ancestor)) {
				const ancestorTs = info.contextTimeInfoEntries.get(ancestor);
				if (ancestorTs !== undefined) {
					this.snapshotDirTimestamps.set(ancestor, ancestorTs);
				}

				ancestor = path.dirname(ancestor);
			}
		}

		this.trace('[WatchIgnoreNextChange] Registered ignore for', file);
	}

	unignoreNextChange(file: string): void {
		this.filesToIgnore.delete(file);
		const dir = path.dirname(file);
		this.dirsToIgnore.delete(dir);
		this.snapshotFileTimestamps.delete(file);
		this.snapshotDirTimestamps.delete(dir);
	}

	// Returns and clears the list of files whose changes were previously
	// suppressed. Caller can use this to e.g. touch the files later and
	// trigger a real rebuild.
	consumeSuppressedFilesHistory(): string[] {
		const files = [...this.suppressedFilesHistory];
		this.suppressedFilesHistory.clear();
		return files;
	}

	apply(compiler: Compiler): void {
		compiler.hooks.afterEnvironment.tap('WatchIgnoreNextChangePlugin', () => {
			const wfs = compiler.watchFileSystem as unknown as NodeWatchFileSystem;
			if (!wfs?.watch) {
				return;
			}

			const originalWatch = wfs.watch.bind(wfs);

			const self = this;

			wfs.watch = (
				files,
				directories,
				missing,
				startTime,
				options,
				callback,
				callbackUndelayed,
			) => {
				const isAncestorOfIgnoredFile = (dir: string): boolean => {
					for (const file of self.filesToIgnore) {
						if (file.startsWith(dir + path.sep)) {
							return true;
						}
					}

					return false;
				};

				const wrappedCallbackUndelayed: CallbackUndelayed = (
					fileName,
					changeTime,
				) => {
					if (
						self.filesToIgnore.has(fileName) ||
						self.dirsToIgnore.has(fileName) ||
						isAncestorOfIgnoredFile(fileName)
					) {
						self.trace(
							'[WatchIgnoreNextChange] Suppressed callbackUndelayed for',
							fileName,
						);
						return;
					}

					callbackUndelayed(fileName, changeTime);
				};

				const wrappedCallback: WatchCallback = (
					err,
					fileTimestamps,
					dirTimestamps,
					changedFiles,
					removedFiles,
				) => {
					const hasIgnoredFiles = self.filesToIgnore.size > 0;
					const suppressedFiles: string[] = [];
					const suppressedDirs: string[] = [];

					if (fileTimestamps) {
						for (const file of [...self.filesToIgnore]) {
							const wasInChanged = changedFiles?.has(file) ?? false;
							if (wasInChanged) {
								changedFiles!.delete(file);
							}

							const prev = self.snapshotFileTimestamps.get(file);
							if (prev !== undefined) {
								fileTimestamps.set(file, prev);
							}

							if (wasInChanged) {
								suppressedFiles.push(file);
								self.suppressedFilesHistory.add(file);
								self.filesToIgnore.delete(file);
								self.snapshotFileTimestamps.delete(file);
							}
						}
					}

					if (dirTimestamps) {
						for (const dir of [...self.dirsToIgnore]) {
							const wasInChanged = changedFiles?.has(dir) ?? false;
							if (wasInChanged) {
								changedFiles!.delete(dir);
							}

							const prev = self.snapshotDirTimestamps.get(dir);
							if (prev !== undefined) {
								dirTimestamps.set(dir, prev);
							}

							if (wasInChanged) {
								suppressedDirs.push(dir);
								self.dirsToIgnore.delete(dir);
								self.snapshotDirTimestamps.delete(dir);
							}
						}
					}

					if (removedFiles) {
						for (const file of self.filesToIgnore) {
							removedFiles.delete(file);
						}

						for (const dir of self.dirsToIgnore) {
							removedFiles.delete(dir);
						}
					}

					// Remove ancestor directories of suppressed files from changedFiles.
					// Watchpack may report parent directories (e.g. /src) as changed
					// alongside the file itself (e.g. /src/Sub/index.tsx).
					// dirsToIgnore only has the immediate parent, so ancestors
					// like /src would remain and trigger a rebuild.
					if (changedFiles && suppressedFiles.length > 0) {
						for (const changed of [...changedFiles]) {
							for (const file of suppressedFiles) {
								if (file.startsWith(changed + path.sep)) {
									changedFiles.delete(changed);
									if (dirTimestamps) {
										const prev = self.snapshotDirTimestamps.get(changed);
										if (prev !== undefined) {
											dirTimestamps.set(changed, prev);
										}
									}

									break;
								}
							}
						}
					}

					const remainingChanges = changedFiles?.size ?? 0;
					const remainingRemovals = removedFiles?.size ?? 0;

					if (
						hasIgnoredFiles &&
						remainingChanges === 0 &&
						remainingRemovals === 0
					) {
						self.trace(
							'[WatchIgnoreNextChange] All changes suppressed, re-registering watcher. Suppressed files:',
							suppressedFiles,
							'dirs:',
							suppressedDirs,
						);

						// Don't call the callback — that would trigger _invalidate() → compile().
						// Instead, re-register the watchpack listeners and unpause,
						// so the watch loop stays alive for future changes.
						// NodeWatchFileSystem uses:
						//   this.watcher.once("change", callbackUndelayed)
						//   this.watcher.once("aggregated", (changes, removals) => { this.watcher.pause(); callback(...) })
						// After "aggregated" fires, the watcher is paused and the .once listeners are consumed.
						// We need to restore them.
						const watchpack = wfs.watcher;
						if (watchpack) {
							watchpack.once(
								'change',
								wrappedCallbackUndelayed as (...args: unknown[]) => void,
							);
							watchpack.once('aggregated', (...args: unknown[]) => {
								const changes = args[0] as Set<string>;
								const removals = args[1] as Set<string>;
								watchpack.pause();
								const fs = wfs.inputFileSystem;
								if (fs?.purge) {
									for (const item of changes) {
										fs.purge(item);
									}

									for (const item of removals) {
										fs.purge(item);
									}
								}

								const fetchedFileTimestamps = new Map<string, TimeInfoEntry>();
								const fetchedContextTimestamps = new Map<
									string,
									TimeInfoEntry
								>();
								(
									watchpack as unknown as {
										collectTimeInfoEntries: (
											a: Map<string, TimeInfoEntry>,
											b: Map<string, TimeInfoEntry>,
										) => void;
									}
								).collectTimeInfoEntries(
									fetchedFileTimestamps,
									fetchedContextTimestamps,
								);

								wrappedCallback(
									null,
									fetchedFileTimestamps,
									fetchedContextTimestamps,
									changes,
									removals,
								);
							});
							watchpack.paused = false;
							// Clear suppressed files from accumulated changes.
							// While paused, watchpack's _onChange still adds to
							// aggregatedChanges. If we don't clear them, unpausing
							// will cause the same files to re-trigger via _onTimeout.
							for (const file of suppressedFiles) {
								watchpack.aggregatedChanges.delete(file);
								watchpack.aggregatedRemovals.delete(file);
							}

							for (const dir of suppressedDirs) {
								watchpack.aggregatedChanges.delete(dir);
								watchpack.aggregatedRemovals.delete(dir);
							}

							// Also clear ancestor directories of suppressed files
							for (const file of suppressedFiles) {
								let ancestor = path.dirname(path.dirname(file));
								while (ancestor !== path.dirname(ancestor)) {
									watchpack.aggregatedChanges.delete(ancestor);
									watchpack.aggregatedRemovals.delete(ancestor);
									ancestor = path.dirname(ancestor);
								}
							}
						} else {
							callback(
								err,
								fileTimestamps,
								dirTimestamps,
								changedFiles,
								removedFiles,
							);
						}

						return;
					}

					if (hasIgnoredFiles) {
						self.trace(
							'[WatchIgnoreNextChange] Partial suppression. Remaining changes:',
							changedFiles ? [...changedFiles] : [],
						);
					}

					callback(
						err,
						fileTimestamps,
						dirTimestamps,
						changedFiles,
						removedFiles,
					);
				};

				const watcher = originalWatch(
					files,
					directories,
					missing,
					startTime,
					options,
					wrappedCallback,
					wrappedCallbackUndelayed,
				);

				self.currentWatcher = watcher;

				const originalGetFileTimeInfoEntries =
					watcher.getFileTimeInfoEntries.bind(watcher);
				watcher.getFileTimeInfoEntries = () => {
					const entries = originalGetFileTimeInfoEntries();
					for (const file of self.filesToIgnore) {
						const prev = self.snapshotFileTimestamps.get(file);
						if (prev !== undefined) {
							entries.set(file, prev);
						}
					}

					return entries;
				};

				const originalGetContextTimeInfoEntries =
					watcher.getContextTimeInfoEntries.bind(watcher);
				watcher.getContextTimeInfoEntries = () => {
					const entries = originalGetContextTimeInfoEntries();
					for (const dir of self.dirsToIgnore) {
						const prev = self.snapshotDirTimestamps.get(dir);
						if (prev !== undefined) {
							entries.set(dir, prev);
						}
					}

					return entries;
				};

				if (watcher.getInfo) {
					const originalGetInfo = watcher.getInfo.bind(watcher);
					watcher.getInfo = () => {
						const info = originalGetInfo();
						for (const file of self.filesToIgnore) {
							info.changes.delete(file);
							const prev = self.snapshotFileTimestamps.get(file);
							if (prev !== undefined) {
								info.fileTimeInfoEntries.set(file, prev);
							}
						}

						for (const dir of self.dirsToIgnore) {
							info.changes.delete(dir);
							const prev = self.snapshotDirTimestamps.get(dir);
							if (prev !== undefined) {
								info.contextTimeInfoEntries.set(dir, prev);
							}
						}

						return info;
					};
				}

				if (watcher.getAggregatedChanges) {
					const originalGetAggregatedChanges =
						watcher.getAggregatedChanges.bind(watcher);
					watcher.getAggregatedChanges = () => {
						const changes = originalGetAggregatedChanges();
						for (const file of self.filesToIgnore) {
							changes.delete(file);
						}

						for (const dir of self.dirsToIgnore) {
							changes.delete(dir);
						}

						return changes;
					};
				}

				return watcher;
			};
		});
	}
}
