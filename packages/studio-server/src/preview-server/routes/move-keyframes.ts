import {readFileSync} from 'node:fs';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	MoveEffectKeyframe,
	MoveKeyframesRequest,
	MoveKeyframesResponse,
	MoveSequenceKeyframe,
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

type ResolvedSequenceKeyframe = MoveSequenceKeyframe & {
	index: number;
	absolutePath: string;
	fileRelativeToRoot: string;
};

type ResolvedEffectKeyframe = MoveEffectKeyframe & {
	index: number;
	absolutePath: string;
	fileRelativeToRoot: string;
};

type FileGroup = {
	fileRelativeToRoot: string;
	sequenceKeyframes: ResolvedSequenceKeyframe[];
	effectKeyframes: ResolvedEffectKeyframe[];
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

const getBatchDescription = ({
	totalKeyframes,
	firstKeyframe,
}: {
	totalKeyframes: number;
	firstKeyframe: {key: string; fromFrame: number; toFrame: number};
}) => {
	if (totalKeyframes === 1) {
		return {
			undoMessage: `↩️  ${firstKeyframe.key} keyframe moved back to frame ${firstKeyframe.fromFrame}`,
			redoMessage: `↪️  ${firstKeyframe.key} keyframe moved to frame ${firstKeyframe.toFrame}`,
		};
	}

	return {
		undoMessage: `↩️  ${totalKeyframes} keyframes moved back`,
		redoMessage: `↪️  ${totalKeyframes} keyframes moved`,
	};
};

export const moveKeyframes = async ({
	sequenceKeyframes,
	effectKeyframes,
	clientId,
	remotionRoot,
	logLevel,
}: MoveKeyframesRequest & {
	remotionRoot: string;
	logLevel: LogLevel;
}): Promise<void> => {
	const totalKeyframes = sequenceKeyframes.length + effectKeyframes.length;
	if (totalKeyframes === 0) {
		throw new Error('No keyframes were specified for moving');
	}

	const fileGroups = new Map<string, FileGroup>();

	for (const [index, keyframe] of sequenceKeyframes.entries()) {
		const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
			remotionRoot,
			fileName: keyframe.fileName,
			action: 'modify',
		});
		const group = fileGroups.get(absolutePath) ?? {
			fileRelativeToRoot,
			sequenceKeyframes: [],
			effectKeyframes: [],
		};
		group.sequenceKeyframes.push({
			...keyframe,
			index,
			absolutePath,
			fileRelativeToRoot,
		});
		fileGroups.set(absolutePath, group);
	}

	for (const [index, keyframe] of effectKeyframes.entries()) {
		const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
			remotionRoot,
			fileName: keyframe.fileName,
			action: 'modify',
		});
		const group = fileGroups.get(absolutePath) ?? {
			fileRelativeToRoot,
			sequenceKeyframes: [],
			effectKeyframes: [],
		};
		group.effectKeyframes.push({
			...keyframe,
			index,
			absolutePath,
			fileRelativeToRoot,
		});
		fileGroups.set(absolutePath, group);
	}

	const snapshots: UndoSnapshot[] = [];
	const sequenceLogs: SequenceLog[] = [];
	const effectLogs: EffectLog[] = [];

	for (const [absolutePath, group] of fileGroups) {
		const fileContents = readFileSync(absolutePath, 'utf-8');
		let output = fileContents;
		let firstLogLine = Number.POSITIVE_INFINITY;

		for (const keyframeGroup of groupBy(group.sequenceKeyframes, (keyframe) =>
			JSON.stringify(keyframe.nodePath.nodePath),
		)) {
			const [firstSequenceKeyframe] = keyframeGroup;
			if (!firstSequenceKeyframe) {
				continue;
			}

			const updates = groupBy(keyframeGroup, (keyframe) => keyframe.key).map(
				(keyframes) => {
					const [firstMove] = keyframes;
					if (!firstMove) {
						throw new Error('Expected keyframe');
					}

					return {
						key: firstMove.key,
						operation: {
							type: 'move' as const,
							moves: keyframes.map((keyframe) => ({
								fromFrame: keyframe.fromFrame,
								toFrame: keyframe.toFrame,
							})),
						},
					};
				},
			);

			const result = await updateSequenceKeyframes({
				input: output,
				nodePath: firstSequenceKeyframe.nodePath.nodePath,
				schema: firstSequenceKeyframe.schema,
				updates,
			});
			output = result.output;
			firstLogLine = Math.min(firstLogLine, result.logLine);

			for (const [updateIndex, update] of updates.entries()) {
				sequenceLogs.push({
					fileRelativeToRoot: firstSequenceKeyframe.fileRelativeToRoot,
					line: result.logLine,
					key: update.key,
					oldValueString: result.oldValueStrings[updateIndex],
					newValueString: result.newValueStrings[updateIndex],
					formatted: result.formatted,
				});
			}
		}

		for (const keyframeGroup of groupBy(
			group.effectKeyframes,
			(keyframe) =>
				`${JSON.stringify(keyframe.sequenceNodePath.nodePath)}:${
					keyframe.effectIndex
				}`,
		)) {
			const [firstEffectKeyframe] = keyframeGroup;
			if (!firstEffectKeyframe) {
				continue;
			}

			const updates = groupBy(keyframeGroup, (keyframe) => keyframe.key).map(
				(keyframes) => {
					const [firstMove] = keyframes;
					if (!firstMove) {
						throw new Error('Expected keyframe');
					}

					return {
						key: firstMove.key,
						operation: {
							type: 'move' as const,
							moves: keyframes.map((keyframe) => ({
								fromFrame: keyframe.fromFrame,
								toFrame: keyframe.toFrame,
							})),
						},
					};
				},
			);

			const result = await updateEffectKeyframes({
				input: output,
				sequenceNodePath: firstEffectKeyframe.sequenceNodePath.nodePath,
				effectIndex: firstEffectKeyframe.effectIndex,
				schema: firstEffectKeyframe.schema,
				updates,
			});
			output = result.output;
			firstLogLine = Math.min(firstLogLine, result.logLine);

			for (const [updateIndex, update] of updates.entries()) {
				effectLogs.push({
					fileRelativeToRoot: firstEffectKeyframe.fileRelativeToRoot,
					line: result.logLine,
					effectName: result.effectCallee,
					propKey: update.key,
					oldValueString: result.oldValueStrings[updateIndex],
					newValueString: result.newValueStrings[updateIndex],
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

	const [firstKeyframe] =
		sequenceKeyframes.length > 0 ? sequenceKeyframes : effectKeyframes;
	if (!firstKeyframe) {
		throw new Error('No keyframes were specified for moving');
	}

	pushTransactionToUndoStack({
		snapshots,
		logLevel,
		remotionRoot,
		description: getBatchDescription({totalKeyframes, firstKeyframe}),
		entryType:
			sequenceKeyframes.length > 0 && effectKeyframes.length > 0
				? 'keyframe-delete'
				: sequenceKeyframes.length > 0
					? 'sequence-props'
					: 'effect-props',
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
			fileRelativeToRoot: log.fileRelativeToRoot,
			line: log.line,
			key: log.key,
			oldValueString: log.oldValueString,
			newValueString: log.newValueString,
			defaultValueString: null,
			formatted: log.formatted,
			logLevel,
			removedProps: [],
			addedProps: [],
		});
	}

	for (const log of effectLogs) {
		logEffectUpdate({
			fileRelativeToRoot: log.fileRelativeToRoot,
			line: log.line,
			effectName: log.effectName,
			propKey: log.propKey,
			oldValueString: log.oldValueString,
			newValueString: log.newValueString,
			defaultValueString: null,
			formatted: log.formatted,
			logLevel,
			removedProps: [],
			addedProps: [],
		});
	}

	printUndoHint(logLevel);
};

export const moveKeyframesHandler: ApiHandler<
	MoveKeyframesRequest,
	MoveKeyframesResponse
> = ({
	input: {sequenceKeyframes, effectKeyframes, clientId},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue(async () => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[move-keyframes] Received request to move ${
				sequenceKeyframes.length + effectKeyframes.length
			} keyframe(s)`,
		);

		await moveKeyframes({
			sequenceKeyframes,
			effectKeyframes,
			clientId,
			remotionRoot,
			logLevel,
		});

		return {success: true};
	});
