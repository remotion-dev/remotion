import {lstatSync, readFileSync, rmSync} from 'node:fs';
import {CodemodsInternals, insertBasicCaptions} from '@remotion/codemods';
import {RenderInternals} from '@remotion/renderer';
import type {
	InsertBasicCaptionsRequest,
	InsertBasicCaptionsResponse,
} from '@remotion/studio-shared';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {broadcastSequenceNodePathMutation} from '../sequence-node-path-mutation';
import {
	printUndoHint,
	discardLastUndoEntryAfterFailedCommit,
	pushTransactionToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

const {basicCaptionsElementSource, getBasicCaptionsElementFile} =
	CodemodsInternals;

export const insertBasicCaptionsHandler: ApiHandler<
	InsertBasicCaptionsRequest,
	InsertBasicCaptionsResponse
> = ({
	input: {fileName, nodePath, captions, durationInFrames, composition},
	remotionRoot,
	logLevel,
}) =>
	withSourceFileWriteQueue<InsertBasicCaptionsResponse>(() => {
		const attemptedWrites: {
			filePath: string;
			previousContents: string | null;
			nextContents: string;
		}[] = [];
		let undoEntryPushed = false;
		try {
			const {absolutePath} = resolveFileInsideProject({
				remotionRoot,
				fileName,
				action: 'modify',
			});
			const fileContents = readFileSync(absolutePath, 'utf-8');
			const elementFile = getBasicCaptionsElementFile({
				fileName: absolutePath,
				readFileContents: (candidate) => {
					const {absolutePath: elementPath} = resolveFileInsideProject({
						remotionRoot,
						fileName: candidate,
						action: 'create',
					});
					let stat;
					try {
						stat = lstatSync(elementPath);
					} catch (error) {
						if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
							return null;
						}

						throw error;
					}

					if (!stat.isFile()) {
						throw new Error(`Cannot use ${elementPath} for Basic captions`);
					}

					return readFileSync(elementPath, 'utf-8');
				},
			});
			const files: Record<string, string> = {[absolutePath]: fileContents};
			let registration = null;
			if (composition) {
				try {
					const resolved = resolveFileInsideProject({
						remotionRoot,
						fileName: composition.fileName,
						action: 'modify',
					});
					files[resolved.absolutePath] = readFileSync(
						resolved.absolutePath,
						'utf-8',
					);
					registration = {...composition, fileName: resolved.absolutePath};
				} catch {
					registration = null;
				}
			}

			const result = insertBasicCaptions({
				element: null,
				project: {rootDir: remotionRoot, files},
				node: {filePath: absolutePath, nodePath},
				captions,
				durationInFrames,
				composition: registration,
				importPath: elementFile.importPath,
			});
			const {logLine} = result.editDetails[0];
			const changes = [
				...(elementFile.shouldWrite
					? [
							{
								filePath: elementFile.fileName,
								previousContents: null,
								nextContents: basicCaptionsElementSource,
							},
						]
					: []),
				...result.changes,
			];
			const mutationFiles = result.changes
				.map(({filePath}) => ({
					absolutePath: filePath,
					remappings: result.nodePathRemappings
						.filter((remapping) => remapping.filePath === filePath)
						.map(({filePath: _filePath, ...remapping}) => remapping),
				}))
				.filter(({remappings}) => remappings.length > 0);
			pushTransactionToUndoStack({
				snapshots: changes.map((change) => ({
					filePath: change.filePath,
					oldContents: change.previousContents,
					newContents: change.nextContents,
					logLine: change.filePath === absolutePath ? logLine : 1,
					nodePathRemappings:
						mutationFiles.find((file) => file.absolutePath === change.filePath)
							?.remappings ?? null,
				})),
				logLevel,
				remotionRoot,
				description: {
					undoMessage: '↩️  Insertion of Basic captions',
					redoMessage: '↪️  Insertion of Basic captions',
				},
				entryType: 'insert-basic-captions',
				suppressHmrOnFileRestore: false,
				undoRedoNavigation: null,
			});
			undoEntryPushed = true;
			for (const change of changes) {
				if (change.nextContents === null) {
					throw new Error('Could not write the captioned source');
				}

				attemptedWrites.push({...change, nextContents: change.nextContents});
				suppressUndoStackInvalidation(change.filePath);
				writeFileAndNotifyFileWatchers({
					file: change.filePath,
					content: change.nextContents,
					originatorClientId: undefined,
					metadata: mutationFiles.some(
						(file) => file.absolutePath === change.filePath,
					)
						? {skipSequencePropsUpdate: true}
						: null,
				});
			}

			const nodePathMutation = broadcastSequenceNodePathMutation(
				mutationFiles,
				null,
			);

			const locationLabel = formatLogFileLocation({
				remotionRoot,
				absolutePath,
				line: logLine,
			});
			RenderInternals.Log.info(
				{indent: false, logLevel},
				`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(locationLabel)} Inserted Basic captions`,
			);
			printUndoHint(logLevel);
			return Promise.resolve({success: true as const, nodePathMutation});
		} catch (error) {
			for (const change of attemptedWrites.reverse()) {
				try {
					if (readFileSync(change.filePath, 'utf-8') !== change.nextContents)
						continue;
					suppressUndoStackInvalidation(change.filePath);
					if (change.previousContents === null) {
						rmSync(change.filePath);
					} else {
						writeFileAndNotifyFileWatchers({
							file: change.filePath,
							content: change.previousContents,
							originatorClientId: undefined,
							metadata: null,
						});
					}
				} catch {}
			}

			if (undoEntryPushed) discardLastUndoEntryAfterFailedCommit();
			return Promise.resolve({
				success: false,
				reason: (error as Error).message,
				stack: (error as Error).stack ?? '',
			} as const);
		}
	});
