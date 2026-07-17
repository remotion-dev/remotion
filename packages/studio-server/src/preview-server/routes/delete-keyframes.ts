import {readFileSync} from 'node:fs';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	DeleteEffectKeyframe,
	DeleteKeyframesRequest,
	DeleteKeyframesResponse,
	DeleteSequenceKeyframe,
	SaveEffectPropsResponse,
	SaveSequencePropsResult,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import {parseAst} from '../../codemods/parse-ast';
import {
	updateEffectKeyframes,
	updateSequenceKeyframes,
} from '../../codemods/update-keyframes/update-keyframes';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import {getVideoConfigIdentifierValues} from '../../helpers/video-config-values';
import type {ApiHandler} from '../api-types';
import {
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {computeEffectPropStatus} from './can-update-effect-props';
import {
	computeSequencePropsStatusFromContent,
	findJsxElementAtNodePath,
} from './can-update-sequence-props';
import {logEffectUpdate} from './log-updates/log-effect-update';
import {logUpdate} from './log-updates/log-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

type ResolvedSequenceKeyframe = DeleteSequenceKeyframe & {
	index: number;
	absolutePath: string;
	fileRelativeToRoot: string;
};

type ResolvedEffectKeyframe = DeleteEffectKeyframe & {
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
	firstKeyframe: {key: string; frame: number};
}) => {
	if (totalKeyframes === 1) {
		return {
			undoMessage: `↩️  ${firstKeyframe.key} keyframe restored at frame ${firstKeyframe.frame}`,
			redoMessage: `↪️  ${firstKeyframe.key} keyframe deleted at frame ${firstKeyframe.frame}`,
		};
	}

	return {
		undoMessage: `↩️  ${totalKeyframes} keyframes restored`,
		redoMessage: `↪️  ${totalKeyframes} keyframes deleted`,
	};
};

export const deleteKeyframes = async ({
	sequenceKeyframes,
	effectKeyframes,
	clientId,
	remotionRoot,
	logLevel,
}: {
	sequenceKeyframes: DeleteSequenceKeyframe[];
	effectKeyframes: DeleteEffectKeyframe[];
	clientId: string;
	remotionRoot: string;
	logLevel: LogLevel;
}): Promise<{
	sequenceResults: SaveSequencePropsResult[];
	effectResults: SaveEffectPropsResponse[];
}> => {
	const totalKeyframes = sequenceKeyframes.length + effectKeyframes.length;
	if (totalKeyframes === 0) {
		throw new Error('No keyframes were specified for deletion');
	}

	const fileGroups = new Map<string, FileGroup>();
	const resolvedSequenceKeyframes: ResolvedSequenceKeyframe[] = [];
	const resolvedEffectKeyframes: ResolvedEffectKeyframe[] = [];

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
		const resolved = {...keyframe, index, absolutePath, fileRelativeToRoot};
		group.sequenceKeyframes.push(resolved);
		resolvedSequenceKeyframes.push(resolved);
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
		const resolved = {...keyframe, index, absolutePath, fileRelativeToRoot};
		group.effectKeyframes.push(resolved);
		resolvedEffectKeyframes.push(resolved);
		fileGroups.set(absolutePath, group);
	}

	const snapshots: UndoSnapshot[] = [];
	const outputByPath = new Map<string, string>();
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
				videoConfigValues: firstSequenceKeyframe.nodePath.videoConfigValues,
				updates: keyframeGroup.map((keyframe) => ({
					key: keyframe.key,
					operation: {
						type: 'remove',
						frame: keyframe.frame,
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
				`${JSON.stringify(keyframe.sequenceNodePath.nodePath)}:${keyframe.effectIndex}`,
		)) {
			const [firstEffectKeyframe] = keyframeGroup;
			if (!firstEffectKeyframe) {
				continue;
			}

			const result = await updateEffectKeyframes({
				input: output,
				sequenceNodePath: firstEffectKeyframe.sequenceNodePath.nodePath,
				effectIndex: firstEffectKeyframe.effectIndex,
				videoConfigValues:
					firstEffectKeyframe.sequenceNodePath.videoConfigValues,
				updates: keyframeGroup.map((keyframe) => ({
					key: keyframe.key,
					operation: {
						type: 'remove',
						frame: keyframe.frame,
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
		outputByPath.set(absolutePath, output);
	}

	const [firstKeyframe] =
		sequenceKeyframes.length > 0 ? sequenceKeyframes : effectKeyframes;
	if (!firstKeyframe) {
		throw new Error('No keyframes were specified for deletion');
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

	const sequenceResults = resolvedSequenceKeyframes.map((keyframe) => {
		const output = outputByPath.get(keyframe.absolutePath);
		if (!output) {
			throw new Error('Could not compute sequence keyframe deletion status');
		}

		const status = computeSequencePropsStatusFromContent({
			fileContents: output,
			keys: getAllSchemaKeys(keyframe.schema),
			nodePath: keyframe.nodePath.nodePath,
			componentIdentity: null,
			effects: [],
			videoConfigValues: keyframe.nodePath.videoConfigValues,
		});

		return {
			fileName: keyframe.fileName,
			nodePath: keyframe.nodePath,
			props: status.props,
		};
	});

	const astByPath = new Map<string, ReturnType<typeof parseAst>>();
	const effectResults = resolvedEffectKeyframes.map((keyframe) => {
		const output = outputByPath.get(keyframe.absolutePath);
		if (!output) {
			throw new Error('Could not compute effect keyframe deletion status');
		}

		const ast = astByPath.get(keyframe.absolutePath) ?? parseAst(output);
		astByPath.set(keyframe.absolutePath, ast);
		const jsx = findJsxElementAtNodePath(
			ast,
			keyframe.sequenceNodePath.nodePath,
		);
		if (!jsx) {
			return {
				canUpdate: false as const,
				effectIndex: keyframe.effectIndex,
				reason: 'not-found' as const,
			};
		}

		return computeEffectPropStatus({
			ast,
			jsx,
			effectIndex: keyframe.effectIndex,
			keys: getAllSchemaKeys(keyframe.schema),
			videoConfigValues: getVideoConfigIdentifierValues({
				ast,
				videoConfigValues: keyframe.sequenceNodePath.videoConfigValues,
			}),
		});
	});

	return {sequenceResults, effectResults};
};

export const deleteKeyframesHandler: ApiHandler<
	DeleteKeyframesRequest,
	DeleteKeyframesResponse
> = ({
	input: {sequenceKeyframes, effectKeyframes, clientId},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue(async () => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[delete-keyframes] Received request to delete ${
				sequenceKeyframes.length + effectKeyframes.length
			} keyframe(s)`,
		);

		await deleteKeyframes({
			sequenceKeyframes,
			effectKeyframes,
			clientId,
			remotionRoot,
			logLevel,
		});

		return {success: true};
	});
