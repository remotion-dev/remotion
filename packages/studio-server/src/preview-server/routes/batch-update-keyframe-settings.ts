import {readFileSync} from 'node:fs';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	BatchUpdateEffectKeyframeSettings,
	BatchUpdateKeyframeSettingsRequest,
	BatchUpdateKeyframeSettingsResponse,
	BatchUpdateSequenceKeyframeSettings,
	KeyframeSettings,
} from '@remotion/studio-shared';
import {
	updateEffectKeyframes,
	updateSequenceKeyframes,
} from '../../codemods/update-keyframes/update-keyframes';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {logEffectUpdate} from './log-updates/log-effect-update';
import {logUpdate} from './log-updates/log-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

type ResolvedSequenceUpdate = BatchUpdateSequenceKeyframeSettings & {
	fileRelativeToRoot: string;
};

type ResolvedEffectUpdate = BatchUpdateEffectKeyframeSettings & {
	fileRelativeToRoot: string;
};

type FileGroup = {
	sequenceKeyframes: ResolvedSequenceUpdate[];
	effectKeyframes: ResolvedEffectUpdate[];
};

type UndoSnapshot = {
	filePath: string;
	oldContents: string;
	newContents: string;
	logLine: number;
};

type SequenceLog = {
	fileRelativeToRoot: string;
	line: number;
	key: string;
	oldValueString: string;
	newValueString: string;
	formatted: boolean;
};

type EffectLog = {
	fileRelativeToRoot: string;
	line: number;
	effectName: string;
	propKey: string;
	oldValueString: string;
	newValueString: string;
	formatted: boolean;
};

const groupBy = <T>(items: T[], getKey: (item: T) => string): T[][] => {
	const groups = new Map<string, T[]>();
	for (const item of items) {
		const key = getKey(item);
		const group = groups.get(key) ?? [];
		group.push(item);
		groups.set(key, group);
	}

	return [...groups.values()];
};

const toOperation = (settings: KeyframeSettings) =>
	settings.type === 'settings'
		? {
				type: 'settings' as const,
				clamping: settings.clamping,
				posterize: settings.posterize,
				output: settings.output,
			}
		: {
				type: 'easing' as const,
				segmentIndex: settings.segmentIndex,
				easing: settings.easing,
			};

export const batchUpdateKeyframeSettings = async ({
	sequenceKeyframes,
	effectKeyframes,
	clientId,
	remotionRoot,
	logLevel,
}: BatchUpdateKeyframeSettingsRequest & {
	remotionRoot: string;
	logLevel: LogLevel;
}): Promise<void> => {
	const totalUpdates = sequenceKeyframes.length + effectKeyframes.length;
	if (totalUpdates === 0) {
		throw new Error('No keyframe settings updates were specified');
	}

	const fileGroups = new Map<string, FileGroup>();
	for (const update of sequenceKeyframes) {
		const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
			remotionRoot,
			fileName: update.fileName,
			action: 'modify',
		});
		const group = fileGroups.get(absolutePath) ?? {
			sequenceKeyframes: [],
			effectKeyframes: [],
		};
		group.sequenceKeyframes.push({...update, fileRelativeToRoot});
		fileGroups.set(absolutePath, group);
	}

	for (const update of effectKeyframes) {
		const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
			remotionRoot,
			fileName: update.fileName,
			action: 'modify',
		});
		const group = fileGroups.get(absolutePath) ?? {
			sequenceKeyframes: [],
			effectKeyframes: [],
		};
		group.effectKeyframes.push({...update, fileRelativeToRoot});
		fileGroups.set(absolutePath, group);
	}

	const snapshots: UndoSnapshot[] = [];
	const sequenceLogs: SequenceLog[] = [];
	const effectLogs: EffectLog[] = [];
	for (const [absolutePath, group] of fileGroups) {
		const fileContents = readFileSync(absolutePath, 'utf-8');
		let output = fileContents;
		let firstLogLine = Number.POSITIVE_INFINITY;

		for (const updates of groupBy(group.sequenceKeyframes, (update) =>
			JSON.stringify(update.nodePath.nodePath),
		)) {
			const firstUpdate = updates[0];
			const result = await updateSequenceKeyframes({
				input: output,
				nodePath: firstUpdate.nodePath.nodePath,
				schema: firstUpdate.schema,
				videoConfigValues: firstUpdate.nodePath.videoConfigValues,
				updates: updates.map((update) => ({
					key: update.key,
					operation: toOperation(update.settings),
				})),
			});
			output = result.output;
			firstLogLine = Math.min(firstLogLine, result.logLine);

			for (const [index, update] of updates.entries()) {
				sequenceLogs.push({
					fileRelativeToRoot: update.fileRelativeToRoot,
					line: result.logLine,
					key: update.key,
					oldValueString: result.oldValueStrings[index],
					newValueString: result.newValueStrings[index],
					formatted: result.formatted,
				});
			}
		}

		for (const updates of groupBy(
			group.effectKeyframes,
			(update) =>
				`${JSON.stringify(update.sequenceNodePath.nodePath)}:${
					update.effectIndex
				}`,
		)) {
			const firstUpdate = updates[0];
			const result = await updateEffectKeyframes({
				input: output,
				sequenceNodePath: firstUpdate.sequenceNodePath.nodePath,
				effectIndex: firstUpdate.effectIndex,
				schema: firstUpdate.schema,
				videoConfigValues: firstUpdate.sequenceNodePath.videoConfigValues,
				updates: updates.map((update) => ({
					key: update.key,
					operation: toOperation(update.settings),
				})),
			});
			output = result.output;
			firstLogLine = Math.min(firstLogLine, result.logLine);

			for (const [index, update] of updates.entries()) {
				effectLogs.push({
					fileRelativeToRoot: update.fileRelativeToRoot,
					line: result.logLine,
					effectName: result.effectCallee,
					propKey: update.key,
					oldValueString: result.oldValueStrings[index],
					newValueString: result.newValueStrings[index],
					formatted: result.formatted,
				});
			}
		}

		snapshots.push({
			filePath: absolutePath,
			oldContents: fileContents,
			newContents: output,
			logLine: Number.isFinite(firstLogLine) ? firstLogLine : 1,
		});
	}

	pushTransactionToUndoStack({
		snapshots,
		logLevel,
		remotionRoot,
		description:
			totalUpdates === 1
				? {
						undoMessage: '↩️  Keyframe settings reverted',
						redoMessage: '↪️  Keyframe settings updated',
					}
				: {
						undoMessage: `↩️  ${totalUpdates} keyframe settings reverted`,
						redoMessage: `↪️  ${totalUpdates} keyframe settings updated`,
					},
		entryType: sequenceKeyframes.length > 0 ? 'sequence-props' : 'effect-props',
		suppressHmrOnFileRestore: true,
	});

	for (const snapshot of snapshots) {
		suppressUndoStackInvalidation(snapshot.filePath);
		suppressBundlerUpdateForFile(snapshot.filePath);
		writeFileAndNotifyFileWatchers(
			snapshot.filePath,
			snapshot.newContents,
			clientId,
		);
	}

	for (const log of sequenceLogs) {
		logUpdate({
			...log,
			defaultValueString: null,
			logLevel,
			removedProps: [],
			addedProps: [],
		});
	}

	for (const log of effectLogs) {
		logEffectUpdate({
			...log,
			defaultValueString: null,
			logLevel,
			removedProps: [],
			addedProps: [],
		});
	}

	printUndoHint(logLevel);
};

export const batchUpdateKeyframeSettingsHandler: ApiHandler<
	BatchUpdateKeyframeSettingsRequest,
	BatchUpdateKeyframeSettingsResponse
> = ({input, remotionRoot, logLevel}) =>
	withSourceFileWriteQueue(async () => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[batch-update-keyframe-settings] Received ${input.sequenceKeyframes.length + input.effectKeyframes.length} update(s)`,
		);

		await batchUpdateKeyframeSettings({
			...input,
			remotionRoot,
			logLevel,
		});

		return {success: true};
	});
