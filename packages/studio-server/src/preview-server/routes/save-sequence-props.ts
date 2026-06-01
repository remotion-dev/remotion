import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	SaveSequencePropEdit,
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SaveSequencePropsResult,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import {NoReactInternals} from 'remotion/no-react';
import {
	type RemovedProp,
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
import {formatPropChange} from './log-updates/format-prop-change';
import {logUpdate, normalizeQuotes} from './log-updates/log-update';
import {withSavePropsLock} from './save-props-mutex';

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
};

type SequencePropEditGroup = {
	fileRelativeToRoot: string;
	edits: ResolvedSequencePropEdit[];
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

export const saveSequencePropsHandler: ApiHandler<
	SaveSequencePropsRequest,
	SaveSequencePropsResponse
> = ({
	input: {edits, clientId, undoLabel, redoLabel},
	remotionRoot,
	logLevel,
}) =>
	withSavePropsLock(async () => {
		if (edits.length === 0) {
			throw new Error('No sequence prop edits to save');
		}

		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[save-sequence-props] Received request with ${edits.length} edit(s)`,
		);

		const editGroups = new Map<string, SequencePropEditGroup>();

		for (const [index, edit] of edits.entries()) {
			const parsedValue = JSON.parse(edit.value);
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
			};
			group.edits.push({
				index,
				fileName: edit.fileName,
				nodePath: edit.nodePath,
				key: edit.key,
				value: parsedValue,
				valueString: JSON.stringify(parsedValue),
				defaultValue: parsedDefaultValue,
				defaultValueString:
					parsedDefaultValue !== null
						? JSON.stringify(parsedDefaultValue)
						: null,
				schema: edit.schema,
			});
			editGroups.set(absolutePath, group);
		}

		const snapshots: SequencePropUndoSnapshot[] = [];
		const outputByPath = new Map<string, string>();
		const resultByIndex = new Map<number, SequencePropEditResult>();

		for (const [absolutePath, group] of editGroups) {
			const fileContents = readFileSync(absolutePath, 'utf-8');

			const {
				output,
				formatted,
				results: updateResults,
			} = await updateMultipleSequenceProps({
				input: fileContents,
				changes: group.edits.map((edit) => {
					return {
						nodePath: edit.nodePath.nodePath,
						updates: [
							{
								key: edit.key,
								value: edit.value,
								defaultValue: edit.defaultValue,
							},
						],
						schema: NoReactInternals.sequenceSchema,
					};
				}),
				prettierConfigOverride: null,
			});

			const [{logLine: firstLogLine}] = updateResults;
			outputByPath.set(absolutePath, output);
			snapshots.push({
				filePath: absolutePath,
				oldContents: fileContents,
				newContents: output,
				logLine: firstLogLine,
			});

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

		const [firstEdit] = edits;
		const firstResult = resultByIndex.get(0);
		if (!firstResult) {
			throw new Error('Could not compute sequence prop edit result');
		}

		const undoMessage =
			undoLabel !== null
				? `↩️  ${undoLabel}`
				: edits.length === 1
					? `↩️  ${formatPropChange({
							key: firstEdit.key,
							oldValueString: normalizeQuotes(
								JSON.stringify(JSON.parse(firstEdit.value)),
							),
							newValueString: normalizeQuotes(firstResult.oldValueString),
							defaultValueString:
								firstEdit.defaultValue !== null
									? normalizeQuotes(
											JSON.stringify(JSON.parse(firstEdit.defaultValue)),
										)
									: null,
							removedProps: [],
							addedProps: firstResult.removedProps,
						})}`
					: '↩️  Update selected sequence props';
		const redoMessage =
			redoLabel !== null
				? `↪️  ${redoLabel}`
				: edits.length === 1
					? `↪️  ${formatPropChange({
							key: firstEdit.key,
							oldValueString: normalizeQuotes(firstResult.oldValueString),
							newValueString: normalizeQuotes(
								JSON.stringify(JSON.parse(firstEdit.value)),
							),
							defaultValueString:
								firstEdit.defaultValue !== null
									? normalizeQuotes(
											JSON.stringify(JSON.parse(firstEdit.defaultValue)),
										)
									: null,
							removedProps: firstResult.removedProps,
							addedProps: [],
						})}`
					: '↪️  Update selected sequence props';

		pushTransactionToUndoStack({
			snapshots,
			logLevel,
			remotionRoot,
			description: {undoMessage, redoMessage},
			entryType: 'sequence-props',
			suppressHmrOnFileRestore: true,
		});

		for (const [absolutePath, output] of outputByPath) {
			suppressUndoStackInvalidation(absolutePath);
			suppressBundlerUpdateForFile(absolutePath);
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
