import {readFileSync} from 'node:fs';
import type {CodemodProject, NodeReference} from '@remotion/codemods';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import {writeFileAndNotifyFileWatchers} from '../file-watcher';
import {resolveFileInsideProject} from '../helpers/resolve-file-inside-project';
import {formatLogFileLocation} from './format-log-file-location';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './routes/source-file-write-queue';
import {broadcastSequenceNodePathMutation} from './sequence-node-path-mutation';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
	type UndoEntryType,
} from './undo-stack';

// Applies a codemod to a single node as one undoable step. Shared by the
// edits that follow a job: matting, pre-rendering and restoring a pre-render.
export const commitNodeCodemod = <
	Result extends {
		changes: {nextContents: string | null}[];
		nodePathRemappings: SequenceNodePathRemapping[];
		logLine: number;
	},
>({
	remotionRoot,
	logLevel,
	fileName,
	nodePath,
	codemod,
	label,
	entryType,
}: {
	remotionRoot: string;
	logLevel: LogLevel;
	fileName: string;
	nodePath: SequenceNodePath;
	codemod: (options: {project: CodemodProject; node: NodeReference}) => Result;
	label: string;
	entryType: UndoEntryType;
}) =>
	withSourceFileWriteQueue(() => {
		const {absolutePath} = resolveFileInsideProject({
			remotionRoot,
			fileName,
			action: 'modify',
		});
		const fileContents = readFileSync(absolutePath, 'utf-8');
		const result = codemod({
			project: {
				files: {[absolutePath]: fileContents},
				rootDir: remotionRoot,
			},
			node: {filePath: absolutePath, nodePath},
		});
		const output = result.changes[0]?.nextContents ?? fileContents;
		const {logLine} = result;
		const nodePathRemappings = result.nodePathRemappings.map(
			({oldNodePath, newNodePath, oldJsxName, newJsxName}) => ({
				oldNodePath,
				newNodePath,
				oldJsxName,
				newJsxName,
			}),
		);
		const nodePathMutation = broadcastSequenceNodePathMutation(
			[{absolutePath, remappings: nodePathRemappings}],
			null,
		);

		pushToUndoStack({
			filePath: absolutePath,
			oldContents: fileContents,
			newContents: null,
			logLevel,
			remotionRoot,
			logLine,
			description: {
				undoMessage: `↩️  ${label}`,
				redoMessage: `↪️  ${label}`,
			},
			entryType,
			suppressHmrOnFileRestore: false,
			nodePathRemappings,
		});
		suppressUndoStackInvalidation(absolutePath);
		writeFileAndNotifyFileWatchers({
			file: absolutePath,
			content: output,
			originatorClientId: undefined,
			metadata: {skipSequencePropsUpdate: true},
		});

		const locationLabel = formatLogFileLocation({
			remotionRoot,
			absolutePath,
			line: logLine,
		});
		RenderInternals.Log.info(
			{indent: false, logLevel},
			`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(locationLabel)} ${label}`,
		);
		printUndoHint(logLevel);
		return {absolutePath, nodePathMutation, result};
	});
