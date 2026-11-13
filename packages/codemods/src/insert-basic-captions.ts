import type {ElementInitialProps} from '@remotion/studio-protocol';
import {
	basicCaptionsElementSource,
	getBasicCaptionsElementFile,
} from './basic-captions-element-source';
import {getCodemodResult, type CodemodProject} from './codemod-project';
import {insertBasicCaptions as insertBasicCaptionsInSource} from './insert-basic-captions-in-source';
import {findProjectFile} from './internals';
import {
	getInsertedNodeReferences,
	getNodeEditResult,
	getUpdatedNodeReference,
	type NodeReference,
} from './node-references';

export type InsertBasicCaptionsOptions<Project extends CodemodProject> = {
	project: Project;
	node: NodeReference;
	captions: readonly Parameters<
		typeof insertBasicCaptionsInSource
	>[0]['captions'][number][];
	durationInFrames?: number | null;
	importPath?: string;
	element?: {
		componentName: string;
		initialProps: ElementInitialProps | null;
	} | null;
	prettierConfigOverride?: Record<string, unknown> | null;
};

export const insertBasicCaptions = <Project extends CodemodProject>({
	project,
	node,
	captions,
	durationInFrames = null,
	importPath,
	element = null,
	prettierConfigOverride = null,
}: InsertBasicCaptionsOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const companion =
		importPath === undefined
			? getBasicCaptionsElementFile({
					fileName: filePath,
					readFileContents: (file) => project.files[file] ?? null,
				})
			: null;
	if (element !== null && importPath === undefined)
		throw new Error('A custom caption element requires an importPath');
	const edit = insertBasicCaptionsInSource({
		input: project.files[filePath],
		nodePath: node.nodePath,
		captions: [...captions],
		durationInFrames,
		importPath: importPath ?? companion!.importPath,
		element,
		prettierConfigOverride,
	});
	const result = getNodeEditResult({project, edits: [{filePath, ...edit}]});
	return {
		...result,
		changes: [
			...result.changes,
			...getCodemodResult({
				project,
				edits: companion?.shouldWrite
					? [
							{
								filePath: companion.fileName,
								nextContents: basicCaptionsElementSource,
							},
						]
					: [],
			}).changes,
		],
		updatedNode: getUpdatedNodeReference({project, ...result, node}),
		insertedNodes: getInsertedNodeReferences(result.nodePathRemappings),
		editDetails: [{filePath, logLine: edit.logLine}],
	};
};
