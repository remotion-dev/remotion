import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	MoveEffectKeyframe,
	MoveSequenceKeyframe,
	SaveSequencePropEdit,
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SaveSequencePropsResult,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import {
	updateEffectKeyframes,
	updateSequenceKeyframes,
} from '../../codemods/update-keyframes/update-keyframes';
import {
	type RemovedProp,
	type SequencePropsNodeUpdate,
	updateMultipleSequenceProps,
} from '../../codemods/update-sequence-props/update-sequence-props';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {computeSequencePropsStatusFromContent} from './can-update-sequence-props';
import {logEffectUpdate} from './log-updates/log-effect-update';
import {logUpdate} from './log-updates/log-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

type ResolvedSequencePropEdit = {
	index: number;
	fileName: SaveSequencePropEdit['fileName'];
	nodePath: SaveSequencePropEdit['nodePath'];
	key: SaveSequencePropEdit['key'];
	value: unknown;
	valueString: string;
	defaultValue: unknown | null;
	defaultValueString: string | null;
	schema: SaveSequencePropEdit['schema'];
	sourceEdit: SaveSequencePropEdit['sourceEdit'];
};

type SequencePropEditGroup = {
	fileRelativeToRoot: string;
	edits: ResolvedSequencePropEdit[];
	sequenceKeyframes: ResolvedSequenceKeyframe[];
	effectKeyframes: ResolvedEffectKeyframe[];
};

type ResolvedSequenceKeyframe = MoveSequenceKeyframe & {
	index: number;
};

type ResolvedEffectKeyframe = MoveEffectKeyframe & {
	index: number;
};

const parseSequencePropEditValue = (
	value: SaveSequencePropEdit['value'],
): unknown => {
	if (value.type === 'undefined') {
		return undefined;
	}

	return JSON.parse(value.serialized);
};

const stringifySequencePropEditValue = (value: unknown): string => {
	if (value === undefined) {
		return 'undefined';
	}

	return JSON.stringify(value);
};

type SequencePropUndoSnapshot = {
	filePath: string;
	oldContents: string;
	newContents: string;
	logLine: number;
};

type SequencePropEditResult = {
	oldValueString: string;
	logLine: number;
	removedProps: RemovedProp[];
	formatted: boolean;
};

type SequenceKeyframeLog = {
	fileRelativeToRoot: string;
	line: number;
	key: string;
	oldValueString: string;
	newValueString: string;
	formatted: boolean;
};

type EffectKeyframeLog = {
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

export const convertSequencePropEditToCodemodChange = (
	edit: Pick<
		ResolvedSequencePropEdit,
		'nodePath' | 'key' | 'value' | 'defaultValue' | 'schema' | 'sourceEdit'
	>,
): SequencePropsNodeUpdate => {
	return {
		nodePath: edit.nodePath.nodePath,
		updates: [
			{
				key: edit.key,
				value: edit.value,
				defaultValue: edit.defaultValue,
				googleFont:
					edit.sourceEdit?.type === 'google-font' ? edit.sourceEdit.font : null,
			},
		],
		schema: edit.schema,
	};
};

export const shouldSuppressHmrForSequencePropEdits = (
	edits: readonly {
		key: string;
		sourceEdit?: SaveSequencePropEdit['sourceEdit'];
	}[],
): boolean => {
	return edits.every(
		(edit) =>
			edit.key !== 'showInTimeline' &&
			(edit.sourceEdit === null || edit.sourceEdit === undefined),
	);
};

export const saveSequencePropsHandler: ApiHandler<
	SaveSequencePropsRequest,
	SaveSequencePropsResponse
> = ({
	input: {
		edits,
		movedKeyframes = {sequenceKeyframes: [], effectKeyframes: []},
		clientId,
		undoLabel,
		redoLabel,
	},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue(async () => {
		const totalKeyframeMoves =
			movedKeyframes.sequenceKeyframes.length +
			movedKeyframes.effectKeyframes.length;
		if (edits.length === 0 && totalKeyframeMoves === 0) {
			throw new Error('No sequence prop edits to save');
		}

		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[save-sequence-props] Received request with ${edits.length} edit(s) and ${totalKeyframeMoves} moved keyframe(s)`,
		);

		const editGroups = new Map<string, SequencePropEditGroup>();

		for (const [index, edit] of edits.entries()) {
			const parsedValue = parseSequencePropEditValue(edit.value);
			const parsedDefaultValue =
				edit.defaultValue !== null ? JSON.parse(edit.defaultValue) : null;
			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName: edit.fileName,
				action: 'modify',
			});

			const group = editGroups.get(absolutePath) ?? {
				fileRelativeToRoot,
				edits: [],
				sequenceKeyframes: [],
				effectKeyframes: [],
			};
			group.edits.push({
				index,
				fileName: edit.fileName,
				nodePath: edit.nodePath,
				key: edit.key,
				value: parsedValue,
				valueString: stringifySequencePropEditValue(parsedValue),
				defaultValue: parsedDefaultValue,
				defaultValueString:
					parsedDefaultValue !== null
						? JSON.stringify(parsedDefaultValue)
						: null,
				schema: edit.schema,
				sourceEdit: edit.sourceEdit,
			});
			editGroups.set(absolutePath, group);
		}

		for (const [
			index,
			keyframe,
		] of movedKeyframes.sequenceKeyframes.entries()) {
			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName: keyframe.fileName,
				action: 'modify',
			});
			const group = editGroups.get(absolutePath) ?? {
				fileRelativeToRoot,
				edits: [],
				sequenceKeyframes: [],
				effectKeyframes: [],
			};
			group.sequenceKeyframes.push({...keyframe, index});
			editGroups.set(absolutePath, group);
		}

		for (const [index, keyframe] of movedKeyframes.effectKeyframes.entries()) {
			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName: keyframe.fileName,
				action: 'modify',
			});
			const group = editGroups.get(absolutePath) ?? {
				fileRelativeToRoot,
				edits: [],
				sequenceKeyframes: [],
				effectKeyframes: [],
			};
			group.effectKeyframes.push({...keyframe, index});
			editGroups.set(absolutePath, group);
		}

		const snapshots: SequencePropUndoSnapshot[] = [];
		const outputByPath = new Map<string, string>();
		const resultByIndex = new Map<number, SequencePropEditResult>();
		const sequenceKeyframeLogs: SequenceKeyframeLog[] = [];
		const effectKeyframeLogs: EffectKeyframeLog[] = [];

		for (const [absolutePath, group] of editGroups) {
			const fileContents = readFileSync(absolutePath, 'utf-8');
			let output = fileContents;
			let firstLogLine = Number.POSITIVE_INFINITY;

			if (group.edits.length > 0) {
				const {
					output: sequencePropsOutput,
					formatted,
					results: updateResults,
				} = await updateMultipleSequenceProps({
					input: output,
					changes: group.edits.map(convertSequencePropEditToCodemodChange),
					prettierConfigOverride: null,
				});
				output = sequencePropsOutput;
				const firstUpdate = updateResults[0];
				if (firstUpdate) {
					firstLogLine = Math.min(firstLogLine, firstUpdate.logLine);
				}

				for (const [resultIndex, result] of updateResults.entries()) {
					const edit = group.edits[resultIndex];
					resultByIndex.set(edit.index, {
						oldValueString: result.oldValueStrings[0],
						logLine: result.logLine,
						removedProps: result.removedProps,
						formatted,
					});
				}
			}

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
					sequenceKeyframeLogs.push({
						fileRelativeToRoot: group.fileRelativeToRoot,
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
					effectKeyframeLogs.push({
						fileRelativeToRoot: group.fileRelativeToRoot,
						line: result.logLine,
						effectName: result.effectCallee,
						propKey: update.key,
						oldValueString: result.oldValueStrings[updateIndex],
						newValueString: result.newValueStrings[updateIndex],
						formatted: result.formatted,
					});
				}
			}

			outputByPath.set(absolutePath, output);
			snapshots.push({
				filePath: absolutePath,
				oldContents: fileContents,
				newContents: output,
				logLine: Number.isFinite(firstLogLine) ? firstLogLine : 1,
			});
		}

		const undoMessage = `↩️  ${undoLabel}`;
		const redoMessage = `↪️  ${redoLabel}`;
		const suppressHmr = shouldSuppressHmrForSequencePropEdits(edits);

		pushTransactionToUndoStack({
			snapshots,
			logLevel,
			remotionRoot,
			description: {undoMessage, redoMessage},
			entryType: 'sequence-props',
			suppressHmrOnFileRestore: suppressHmr,
		});

		for (const [absolutePath, output] of outputByPath) {
			suppressUndoStackInvalidation(absolutePath);
			if (suppressHmr) {
				suppressBundlerUpdateForFile(absolutePath);
			}

			writeFileAndNotifyFileWatchers(absolutePath, output, clientId);
		}

		for (const {edits: groupEdits, fileRelativeToRoot} of editGroups.values()) {
			for (const edit of groupEdits) {
				const result = resultByIndex.get(edit.index);
				if (!result) {
					throw new Error('Could not compute sequence prop edit result');
				}

				logUpdate({
					fileRelativeToRoot,
					line: result.logLine,
					key: edit.key,
					oldValueString: result.oldValueString,
					newValueString: edit.valueString,
					defaultValueString: edit.defaultValueString,
					formatted: result.formatted,
					logLevel,
					removedProps: result.removedProps,
					addedProps: [],
				});
			}
		}

		for (const log of sequenceKeyframeLogs) {
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

		for (const log of effectKeyframeLogs) {
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

		const results: SaveSequencePropsResult[] = edits.map((edit) => {
			const {absolutePath} = resolveFileInsideProject({
				remotionRoot,
				fileName: edit.fileName,
				action: 'modify',
			});
			const output = outputByPath.get(absolutePath);
			if (!output) {
				throw new Error('Could not compute sequence prop edit status');
			}

			const newStatus = computeSequencePropsStatusFromContent({
				fileContents: output,
				keys: getAllSchemaKeys(edit.schema),
				nodePath: edit.nodePath.nodePath,
				componentIdentity: null,
				effects: [],
			});

			return {
				fileName: edit.fileName,
				nodePath: edit.nodePath,
				props: newStatus.props,
			};
		});

		return {
			canUpdate: true,
			props: results[0].props,
			results,
		};
	});
