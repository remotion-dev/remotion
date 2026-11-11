import {readFileSync} from 'node:fs';
import {CodemodsInternals} from '@remotion/codemods';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	AddEffectKeyframe,
	AddKeyframesRequest,
	AddKeyframesResponse,
	AddSequenceKeyframe,
	KeyframeMutationResult,
	SequenceNodePathRemapping,
} from '@remotion/studio-shared';
import {captureJsxNodePaths} from '../../codemods/get-node-path-remappings';
import {
	updateEffectKeyframes,
	updateSequenceKeyframes,
	type SourceKeyframeUpdate,
} from '../../codemods/update-keyframes/update-keyframes';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {broadcastSequenceNodePathMutation} from '../sequence-node-path-mutation';
import {
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {getKeyframeMutationResults} from './get-keyframe-mutation-results';
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
	readonly nodePathRemappings: SequenceNodePathRemapping[];
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

const getUpdates = (
	keyframes: readonly Pick<AddSequenceKeyframe, 'key' | 'frame' | 'value'>[],
	paste: AddKeyframesRequest['paste'],
): SourceKeyframeUpdate[] => {
	if (paste !== null) {
		return [
			{
				key: keyframes[0].key,
				operation: {
					type: 'paste',
					keyframeDisplayOffset: paste.keyframeDisplayOffset,
					keyframePlaybackRate: paste.keyframePlaybackRate,
					easing: paste.easing,
					keyframes: keyframes.map((keyframe) => ({
						displayFrame: keyframe.frame,
						value: JSON.parse(keyframe.value),
					})),
				},
			},
		];
	}

	return keyframes.map((keyframe) => ({
		key: keyframe.key,
		operation: {
			type: 'add',
			frame: keyframe.frame,
			value: JSON.parse(keyframe.value),
		},
	}));
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
	paste = null,
	clientId,
	remotionRoot,
	logLevel,
}: AddKeyframesRequest & {
	readonly remotionRoot: string;
	readonly logLevel: LogLevel;
}): Promise<AddKeyframesResponse> => {
	const totalKeyframes = sequenceKeyframes.length + effectKeyframes.length;
	if (totalKeyframes === 0) {
		throw new Error('No keyframes were specified for adding');
	}

	if (paste !== null) {
		const targets = new Set([
			...sequenceKeyframes.map((keyframe) =>
				JSON.stringify([
					keyframe.fileName,
					keyframe.nodePath.nodePath,
					null,
					keyframe.key,
				]),
			),
			...effectKeyframes.map((keyframe) =>
				JSON.stringify([
					keyframe.fileName,
					keyframe.sequenceNodePath.nodePath,
					keyframe.effectIndex,
					keyframe.key,
				]),
			),
		]);
		if (targets.size !== 1)
			throw new Error('Paste must target exactly one keyframe property');
	}

	const fileContentsByPath = new Map<string, string>();
	if (paste?.timingGuards) {
		const files: Record<string, string> = {};
		for (const guard of paste.timingGuards) {
			const {absolutePath} = resolveFileInsideProject({
				remotionRoot,
				fileName: guard.fileName,
				action: 'read',
			});
			const contents =
				fileContentsByPath.get(absolutePath) ??
				readFileSync(absolutePath, 'utf-8');
			fileContentsByPath.set(absolutePath, contents);
			files[guard.fileName] = contents;
		}

		CodemodsInternals.validateKeyframePasteTiming({
			files,
			timingGuards: paste.timingGuards,
		});
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
	const results: KeyframeMutationResult[] = [];
	const resultsByFile = new Map<string, KeyframeMutationResult[]>();

	for (const [absolutePath, group] of fileGroups) {
		const fileContents =
			fileContentsByPath.get(absolutePath) ??
			readFileSync(absolutePath, 'utf-8');
		let output = fileContents;
		let firstLogLine = Number.POSITIVE_INFINITY;
		const originalNodes = captureJsxNodePaths(fileContents);
		const targets: Parameters<
			typeof getKeyframeMutationResults
		>[0]['targets'][number][] = [];

		// Keyframe codemods may wrap a concise arrow in a return statement.
		// JSX nodes remain in order, but their node paths can all change.
		const currentPathFor = (
			originalPath: ResolvedSequenceKeyframe['nodePath']['nodePath'],
		) => {
			const index = originalNodes.findIndex(
				({nodePath}) =>
					JSON.stringify(nodePath) === JSON.stringify(originalPath),
			);
			if (index === -1) {
				throw new Error('Could not find the original JSX node for keyframing');
			}

			const currentNodes = captureJsxNodePaths(output);
			if (currentNodes.length !== originalNodes.length) {
				throw new Error('Could not remap JSX nodes after keyframing');
			}

			return currentNodes[index].nodePath;
		};

		for (const keyframeGroup of groupBy(group.sequenceKeyframes, (keyframe) =>
			JSON.stringify(keyframe.nodePath.nodePath),
		)) {
			const [firstSequenceKeyframe] = keyframeGroup;
			if (!firstSequenceKeyframe) {
				continue;
			}

			const result = await updateSequenceKeyframes({
				input: output,
				nodePath: currentPathFor(firstSequenceKeyframe.nodePath.nodePath),
				schema: firstSequenceKeyframe.schema,
				videoConfigValues: firstSequenceKeyframe.nodePath.videoConfigValues,
				updates: getUpdates(keyframeGroup, paste),
			});
			output = result.output;
			targets.push({
				nodePath: {...firstSequenceKeyframe.nodePath, absolutePath},
				effectIndex: null,
				keys: [...new Set(keyframeGroup.map((keyframe) => keyframe.key))],
			});
			firstLogLine = Math.min(firstLogLine, result.logLine);

			for (const [keyframeIndex, keyframe] of (paste === null
				? keyframeGroup
				: keyframeGroup.slice(0, 1)
			).entries()) {
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
				sequenceNodePath: currentPathFor(
					firstEffectKeyframe.sequenceNodePath.nodePath,
				),
				effectIndex: firstEffectKeyframe.effectIndex,
				schema: firstEffectKeyframe.schema,
				videoConfigValues:
					firstEffectKeyframe.sequenceNodePath.videoConfigValues,
				updates: getUpdates(keyframeGroup, paste),
			});
			output = result.output;
			targets.push({
				nodePath: {...firstEffectKeyframe.sequenceNodePath, absolutePath},
				effectIndex: firstEffectKeyframe.effectIndex,
				keys: [...new Set(keyframeGroup.map((keyframe) => keyframe.key))],
			});
			firstLogLine = Math.min(firstLogLine, result.logLine);

			for (const [keyframeIndex, keyframe] of (paste === null
				? keyframeGroup
				: keyframeGroup.slice(0, 1)
			).entries()) {
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

		const finalNodes = captureJsxNodePaths(output);
		if (finalNodes.length !== originalNodes.length) {
			throw new Error('Could not remap JSX nodes after keyframing');
		}

		const fileResults = getKeyframeMutationResults({
			fileContents: output,
			targets: targets.map((target) => ({
				...target,
				nodePath: {
					...target.nodePath,
					nodePath: currentPathFor(target.nodePath.nodePath),
				},
			})),
		});
		results.push(...fileResults);
		resultsByFile.set(absolutePath, fileResults);

		snapshots.push({
			filePath: absolutePath,
			oldContents: fileContents,
			newContents: output,
			logLine: Number.isFinite(firstLogLine) ? firstLogLine : 1,
			nodePathRemappings: originalNodes.flatMap(
				({location, nodePath}, index) => {
					const next = finalNodes[index];
					return location?.line === next.location?.line &&
						location?.column === next.location?.column &&
						JSON.stringify(nodePath) === JSON.stringify(next.nodePath)
						? []
						: [
								{
									oldNodePath: nodePath,
									newNodePath: next.nodePath,
									sourceLocations: {before: location, after: next.location},
								},
							];
				},
			),
		});
	}

	const [firstKeyframe] =
		sequenceKeyframes.length > 0 ? sequenceKeyframes : effectKeyframes;
	if (!firstKeyframe) {
		throw new Error('No keyframes were specified for adding');
	}

	const filesWithRemappings = snapshots
		.filter((snapshot) => snapshot.nodePathRemappings.length > 0)
		.map((snapshot) => ({
			absolutePath: snapshot.filePath,
			remappings: snapshot.nodePathRemappings,
		}));
	pushTransactionToUndoStack({
		snapshots: snapshots.map((snapshot) => ({
			...snapshot,
			nodePathRemappings: snapshot.nodePathRemappings.length
				? snapshot.nodePathRemappings
				: null,
		})),
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
		undoRedoNavigation: null,
	});

	// Visual Mode evaluates keyframes from prop statuses. Remap and refresh the
	// subscriptions instead of remounting the composition when a hook is added.
	for (const snapshot of snapshots) {
		suppressUndoStackInvalidation(snapshot.filePath);
		suppressBundlerUpdateForFile(snapshot.filePath);

		const sourceVersion = writeFileAndNotifyFileWatchers({
			file: snapshot.filePath,
			content: snapshot.newContents,
			originatorClientId: clientId,
			metadata: snapshot.nodePathRemappings.length
				? {skipSequencePropsUpdate: true}
				: null,
		});
		for (const result of resultsByFile.get(snapshot.filePath) ?? []) {
			result.sourceVersion = sourceVersion;
		}
	}

	const nodePathMutation = filesWithRemappings.length
		? broadcastSequenceNodePathMutation(filesWithRemappings, null, true)
		: null;

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
	return {success: true, nodePathMutation, results};
};

export const addKeyframesHandler: ApiHandler<
	AddKeyframesRequest,
	AddKeyframesResponse
> = ({
	input: {sequenceKeyframes, effectKeyframes, clientId, paste = null},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue(() => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[add-keyframes] Received request to add ${
				sequenceKeyframes.length + effectKeyframes.length
			} keyframe(s)`,
		);

		return addKeyframes({
			sequenceKeyframes,
			effectKeyframes,
			paste,
			clientId,
			remotionRoot,
			logLevel,
		});
	});
