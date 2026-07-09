import {readFileSync} from 'node:fs';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	AddEffectKeyframe,
	AddKeyframesRequest,
	AddKeyframesResponse,
	AddSequenceKeyframe,
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

type ResolvedSequenceKeyframe = AddSequenceKeyframe & {
	readonly index: number;
	readonly absolutePath: string;
	readonly fileRelativeToRoot: string;
};

type ResolvedEffectKeyframe = AddEffectKeyframe & {
	readonly index: number;
	readonly absolutePath: string;
	readonly fileRelativeToRoot: string;
};

type FileGroup = {
	readonly fileRelativeToRoot: string;
	readonly sequenceKeyframes: ResolvedSequenceKeyframe[];
	readonly effectKeyframes: ResolvedEffectKeyframe[];
};

type UndoSnapshot = {
	readonly filePath: string;
	readonly oldContents: string;
	readonly newContents: string;
	readonly logLine: number;
};

type SequenceLog = {
	readonly fileRelativeToRoot: string;
	readonly line: number;
	readonly key: string;
	readonly oldValueString: string;
	readonly newValueString: string;
	readonly formatted: boolean;
};

type EffectLog = {
	readonly fileRelativeToRoot: string;
	readonly line: number;
	readonly effectName: string;
	readonly propKey: string;
	readonly oldValueString: string;
	readonly newValueString: string;
	readonly formatted: boolean;
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
	readonly totalKeyframes: number;
	readonly firstKeyframe: {readonly key: string; readonly frame: number};
}) => {
	if (totalKeyframes === 1) {
		return {
			undoMessage: `↩️  ${firstKeyframe.key} keyframe removed at frame ${firstKeyframe.frame}`,
			redoMessage: `↪️  ${firstKeyframe.key} keyframe added at frame ${firstKeyframe.frame}`,
		};
	}

	return {
		undoMessage: `↩️  ${totalKeyframes} keyframes removed`,
		redoMessage: `↪️  ${totalKeyframes} keyframes added`,
	};
};

export const addKeyframes = async ({
	sequenceKeyframes,
	effectKeyframes,
	clientId,
	remotionRoot,
	logLevel,
}: AddKeyframesRequest & {
	readonly remotionRoot: string;
	readonly logLevel: LogLevel;
}): Promise<void> => {
	const totalKeyframes = sequenceKeyframes.length + effectKeyframes.length;
	if (totalKeyframes === 0) {
		throw new Error('No keyframes were specified for adding');
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

			const result = await updateSequenceKeyframes({
				input: output,
				nodePath: firstSequenceKeyframe.nodePath.nodePath,
				schema: firstSequenceKeyframe.schema,
				updates: keyframeGroup.map((keyframe) => ({
					key: keyframe.key,
					operation: {
						type: 'add',
						frame: keyframe.frame,
						value: JSON.parse(keyframe.value),
					},
				})),
			});
			output = result.output;
			firstLogLine = Math.min(firstLogLine, result.logLine);

			for (const [keyframeIndex, keyframe] of keyframeGroup.entries()) {
				sequenceLogs.push({
					fileRelativeToRoot: keyframe.fileRelativeToRoot,
					line: result.logLine,
					key: keyframe.key,
					oldValueString: result.oldValueStrings[keyframeIndex],
					newValueString: result.newValueStrings[keyframeIndex],
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

			const result = await updateEffectKeyframes({
				input: output,
				sequenceNodePath: firstEffectKeyframe.sequenceNodePath.nodePath,
				effectIndex: firstEffectKeyframe.effectIndex,
				schema: firstEffectKeyframe.schema,
				updates: keyframeGroup.map((keyframe) => ({
					key: keyframe.key,
					operation: {
						type: 'add',
						frame: keyframe.frame,
						value: JSON.parse(keyframe.value),
					},
				})),
			});
			output = result.output;
			firstLogLine = Math.min(firstLogLine, result.logLine);

			for (const [keyframeIndex, keyframe] of keyframeGroup.entries()) {
				effectLogs.push({
					fileRelativeToRoot: keyframe.fileRelativeToRoot,
					line: result.logLine,
					effectName: result.effectCallee,
					propKey: keyframe.key,
					oldValueString: result.oldValueStrings[keyframeIndex],
					newValueString: result.newValueStrings[keyframeIndex],
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
		throw new Error('No keyframes were specified for adding');
	}

	pushTransactionToUndoStack({
		snapshots,
		logLevel,
		remotionRoot,
		description: getBatchDescription({totalKeyframes, firstKeyframe}),
		entryType:
			sequenceKeyframes.length > 0 && effectKeyframes.length > 0
				? // Dead code for now: sequence props and effect props cannot be selected
					// together yet. Keep the mixed transaction type for the planned UI.
					'keyframe-add'
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

export const addKeyframesHandler: ApiHandler<
	AddKeyframesRequest,
	AddKeyframesResponse
> = ({
	input: {sequenceKeyframes, effectKeyframes, clientId},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue(async () => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[add-keyframes] Received request to add ${
				sequenceKeyframes.length + effectKeyframes.length
			} keyframe(s)`,
		);

		await addKeyframes({
			sequenceKeyframes,
			effectKeyframes,
			clientId,
			remotionRoot,
			logLevel,
		});

		return {success: true};
	});
