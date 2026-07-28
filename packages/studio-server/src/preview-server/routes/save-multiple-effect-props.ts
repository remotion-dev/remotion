import {readFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	SaveMultipleEffectPropsEdit,
	SaveMultipleEffectPropsRequest,
	SaveMultipleEffectPropsResponse,
	SaveMultipleEffectPropsResult,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '@remotion/studio-shared';
import {parseAst} from '../../codemods/parse-ast';
import {
	type EffectPropUpdate,
	type UpdateEffectPropsResult,
	updateEffectProps,
} from '../../codemods/update-effect-props/update-effect-props';
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
import {findJsxElementAtNodePath} from './can-update-sequence-props';
import {logEffectUpdate} from './log-updates/log-effect-update';
import {withSourceFileWriteQueue} from './source-file-write-queue';

type ResolvedEffectPropEdit = {
	index: number;
	edit: SaveMultipleEffectPropsEdit;
	update: EffectPropUpdate;
	defaultValueString: string | null;
};

type EffectPropEditGroup = {
	fileRelativeToRoot: string;
	edits: ResolvedEffectPropEdit[];
};

type EffectPropEditResult = UpdateEffectPropsResult & {
	edit: ResolvedEffectPropEdit;
	fileRelativeToRoot: string;
};

const resolveEdit = ({
	edit,
	index,
}: {
	edit: SaveMultipleEffectPropsEdit;
	index: number;
}): ResolvedEffectPropEdit => {
	const defaultValue =
		edit.defaultValue === null ? null : JSON.parse(edit.defaultValue);
	const update =
		edit.type === 'value'
			? {
					key: edit.key,
					value: JSON.parse(edit.value),
					defaultValue,
				}
			: {
					key: edit.key,
					effectParam: edit.effectParam,
					defaultValue,
				};

	return {
		index,
		edit,
		update,
		defaultValueString:
			defaultValue === null ? null : JSON.stringify(defaultValue),
	};
};

export const saveMultipleEffectPropsHandler: ApiHandler<
	SaveMultipleEffectPropsRequest,
	SaveMultipleEffectPropsResponse
> = ({
	input: {edits, clientId, undoLabel, redoLabel},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue(async () => {
		if (edits.length === 0) {
			throw new Error('No effect prop edits to save');
		}

		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[save-multiple-effect-props] Received request with ${edits.length} edit(s)`,
		);

		const editGroups = new Map<string, EffectPropEditGroup>();
		for (const [index, edit] of edits.entries()) {
			const {absolutePath, fileRelativeToRoot} = resolveFileInsideProject({
				remotionRoot,
				fileName: edit.fileName,
				action: 'modify',
			});
			const group = editGroups.get(absolutePath) ?? {
				fileRelativeToRoot,
				edits: [],
			};
			group.edits.push(resolveEdit({edit, index}));
			editGroups.set(absolutePath, group);
		}

		const snapshots: Array<{
			filePath: string;
			oldContents: string;
			newContents: string;
			logLine: number;
		}> = [];
		const outputByPath = new Map<string, string>();
		const resultByIndex = new Map<number, EffectPropEditResult>();

		for (const [absolutePath, group] of editGroups) {
			const fileContents = readFileSync(absolutePath, 'utf-8');
			let output = fileContents;
			let firstLogLine = Number.POSITIVE_INFINITY;

			for (const edit of group.edits) {
				const result = await updateEffectProps({
					input: output,
					sequenceNodePath: edit.edit.sequenceNodePath.nodePath,
					effectIndex: edit.edit.effectIndex,
					update: edit.update,
					schema: edit.edit.schema,
				});
				output = result.output;
				firstLogLine = Math.min(firstLogLine, result.logLine);
				resultByIndex.set(edit.index, {
					...result,
					edit,
					fileRelativeToRoot: group.fileRelativeToRoot,
				});
			}

			outputByPath.set(absolutePath, output);
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
			description: {
				undoMessage: `↩️  ${undoLabel}`,
				redoMessage: `↪️  ${redoLabel}`,
			},
			entryType: 'effect-props',
			suppressHmrOnFileRestore: true,
		});

		for (const [absolutePath, output] of outputByPath) {
			suppressUndoStackInvalidation(absolutePath);
			suppressBundlerUpdateForFile(absolutePath);
			writeFileAndNotifyFileWatchers(absolutePath, output, clientId);
		}

		for (const index of edits.keys()) {
			const result = resultByIndex.get(index);
			if (!result) {
				throw new Error('Could not compute effect prop edit result');
			}

			logEffectUpdate({
				fileRelativeToRoot: result.fileRelativeToRoot,
				line: result.logLine,
				effectName: result.effectCallee,
				propKey: result.edit.edit.key,
				oldValueString: result.oldValueString,
				newValueString: result.newValueString,
				defaultValueString: result.edit.defaultValueString,
				formatted: result.formatted,
				logLevel,
				removedProps: result.removedProps,
				addedProps: [],
			});
		}

		printUndoHint(logLevel);

		const statusTargets = [
			...new Map(
				edits.map((edit) => [
					JSON.stringify([
						edit.fileName,
						edit.sequenceNodePath.nodePath,
						edit.effectIndex,
					]),
					edit,
				]),
			).values(),
		];
		const results: SaveMultipleEffectPropsResult[] = statusTargets.map(
			(edit) => {
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
				const jsx = findJsxElementAtNodePath(
					ast,
					edit.sequenceNodePath.nodePath,
				);
				const status = jsx
					? computeEffectPropStatus({
							ast,
							jsx,
							effectIndex: edit.effectIndex,
							keys: getAllSchemaKeys(edit.schema),
							videoConfigValues: getVideoConfigIdentifierValues({
								ast,
								videoConfigValues: edit.sequenceNodePath.videoConfigValues,
							}),
						})
					: {
							canUpdate: false as const,
							effectIndex: edit.effectIndex,
							reason: 'not-found' as const,
						};

				return {
					fileName: edit.fileName,
					sequenceNodePath: edit.sequenceNodePath,
					status,
				};
			},
		);

		return {results};
	});
