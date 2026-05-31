import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	SaveEffectPropEdit,
	SaveEffectPropsRequest,
	SaveEffectPropsResponse,
	SaveEffectPropsResult,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import {parseAst} from '../../codemods/parse-ast';
import {
	type PropDelta,
	updateMultipleEffectProps,
} from '../../codemods/update-effect-props/update-effect-props';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {
	printUndoHint,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {computeEffectPropStatus} from './can-update-effect-props';
import {findJsxElementAtNodePath} from './can-update-sequence-props';
import {formatEffectPropChange} from './log-updates/format-effect-prop-change';
import {logEffectUpdate} from './log-updates/log-effect-update';
import {normalizeQuotes} from './log-updates/log-update';
import {withSavePropsLock} from './save-props-mutex';

type ResolvedEffectPropEdit = {
	index: number;
	fileName: SaveEffectPropEdit['fileName'];
	sequenceNodePath: SaveEffectPropEdit['sequenceNodePath'];
	effectIndex: SaveEffectPropEdit['effectIndex'];
	key: SaveEffectPropEdit['key'];
	value: unknown;
	valueString: string;
	defaultValue: unknown | null;
	defaultValueString: string | null;
	schema: SaveEffectPropEdit['schema'];
};

type EffectPropEditGroup = {
	fileRelativeToRoot: string;
	edits: ResolvedEffectPropEdit[];
};

type EffectPropUndoSnapshot = {
	filePath: string;
	oldContents: string;
	newContents: string;
	logLine: number;
};

type EffectPropEditResult = {
	oldValueString: string;
	logLine: number;
	effectCallee: string;
	removedProps: PropDelta[];
	formatted: boolean;
};

export const saveEffectPropsHandler: ApiHandler<
	SaveEffectPropsRequest,
	SaveEffectPropsResponse
> = ({
	input: {edits, clientId, undoLabel, redoLabel},
	remotionRoot,
	logLevel,
}) =>
	withSavePropsLock(async () => {
		if (edits.length === 0) {
			throw new Error('No effect prop edits to save');
		}

		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[save-effect-props] Received request with ${edits.length} edit(s)`,
		);

		const editGroups = new Map<string, EffectPropEditGroup>();
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
				sequenceNodePath: edit.sequenceNodePath,
				effectIndex: edit.effectIndex,
				key: edit.key,
				value: parsedValue,
				valueString: edit.value,
				defaultValue: parsedDefaultValue,
				defaultValueString:
					parsedDefaultValue !== null
						? JSON.stringify(parsedDefaultValue)
						: null,
				schema: edit.schema,
			});
			editGroups.set(absolutePath, group);
		}

		const snapshots: EffectPropUndoSnapshot[] = [];
		const outputByPath = new Map<string, string>();
		const resultByIndex = new Map<number, EffectPropEditResult>();

		for (const [absolutePath, group] of editGroups) {
			const fileContents = readFileSync(absolutePath, 'utf-8');
			const {
				output,
				formatted,
				results: updateResults,
			} = await updateMultipleEffectProps({
				input: fileContents,
				changes: group.edits.map((edit) => {
					return {
						sequenceNodePath: edit.sequenceNodePath.nodePath,
						effectIndex: edit.effectIndex,
						update: {
							key: edit.key,
							value: edit.value,
							defaultValue: edit.defaultValue,
						},
						schema: edit.schema,
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
					...result,
					formatted,
				});
			}
		}

		const [firstEdit] = edits;
		const firstResult = resultByIndex.get(0);
		if (!firstResult) {
			throw new Error('Could not compute effect prop edit result');
		}

		const normalizedOld = normalizeQuotes(firstResult.oldValueString);
		const normalizedNew = normalizeQuotes(firstEdit.value);
		const normalizedDefault =
			firstEdit.defaultValue !== null
				? normalizeQuotes(firstEdit.defaultValue)
				: null;
		const normalizedRemovedProps = firstResult.removedProps.map((prop) => ({
			...prop,
			valueString: normalizeQuotes(prop.valueString),
		}));

		const undoPropChange = formatEffectPropChange({
			effectName: firstResult.effectCallee,
			key: firstEdit.key,
			oldValueString: normalizedNew,
			newValueString: normalizedOld,
			defaultValueString: normalizedDefault,
			removedProps: [],
			addedProps: normalizedRemovedProps,
		});
		const redoPropChange = formatEffectPropChange({
			effectName: firstResult.effectCallee,
			key: firstEdit.key,
			oldValueString: normalizedOld,
			newValueString: normalizedNew,
			defaultValueString: normalizedDefault,
			removedProps: normalizedRemovedProps,
			addedProps: [],
		});
		const undoMessage =
			undoLabel !== null
				? `↩️  ${undoLabel}`
				: edits.length === 1
					? `↩️  ${undoPropChange}`
					: '↩️  Update selected effect props';
		const redoMessage =
			redoLabel !== null
				? `↪️  ${redoLabel}`
				: edits.length === 1
					? `↪️  ${redoPropChange}`
					: '↪️  Update selected effect props';

		pushTransactionToUndoStack({
			snapshots,
			logLevel,
			remotionRoot,
			description: {undoMessage, redoMessage},
			entryType: 'effect-props',
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
					throw new Error('Could not compute effect prop edit result');
				}

				logEffectUpdate({
					fileRelativeToRoot,
					line: result.logLine,
					effectName: result.effectCallee,
					propKey: edit.key,
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

		const results: SaveEffectPropsResult[] = edits.map((edit) => {
			const {absolutePath} = resolveFileInsideProject({
				remotionRoot,
				fileName: edit.fileName,
				action: 'modify',
			});
			const output = outputByPath.get(absolutePath);
			if (!output) {
				throw new Error('Could not compute effect prop edit status');
			}

			const ast = parseAst(output);
			const jsx = findJsxElementAtNodePath(ast, edit.sequenceNodePath.nodePath);
			const status = jsx
				? computeEffectPropStatus({
						jsx,
						effectIndex: edit.effectIndex,
						keys: getAllSchemaKeys(edit.schema),
					})
				: ({
						canUpdate: false,
						effectIndex: edit.effectIndex,
						reason: 'not-found',
					} as const);

			return {
				fileName: edit.fileName,
				sequenceNodePath: edit.sequenceNodePath,
				effectIndex: edit.effectIndex,
				status,
			};
		});

		return {
			...results[0].status,
			results,
		};
	});
