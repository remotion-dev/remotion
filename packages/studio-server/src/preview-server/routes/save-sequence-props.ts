import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	SaveSequencePropEdit,
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SaveSequencePropsResult,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
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
import {logUpdate} from './log-updates/log-update';
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
	remove: boolean;
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

export const convertSequencePropEditToCodemodChange = (
	edit: Pick<
		ResolvedSequencePropEdit,
		'nodePath' | 'key' | 'value' | 'defaultValue' | 'schema'
	> &
		Pick<Partial<ResolvedSequencePropEdit>, 'remove'>,
): SequencePropsNodeUpdate => {
	return {
		nodePath: edit.nodePath.nodePath,
		updates: [
			{
				key: edit.key,
				value: edit.value,
				defaultValue: edit.remove ? undefined : edit.defaultValue,
			},
		],
		schema: edit.schema,
	};
};

export const shouldSuppressHmrForSequencePropEdits = (
	edits: readonly {key: string}[],
): boolean => {
	return edits.every((edit) => edit.key !== 'showInTimeline');
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
			const parsedValue = edit.remove ? undefined : JSON.parse(edit.value);
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
				valueString: edit.remove ? 'undefined' : JSON.stringify(parsedValue),
				defaultValue: parsedDefaultValue,
				defaultValueString:
					parsedDefaultValue !== null
						? JSON.stringify(parsedDefaultValue)
						: null,
				schema: edit.schema,
				remove: edit.remove ?? false,
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
				changes: group.edits.map(convertSequencePropEditToCodemodChange),
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
