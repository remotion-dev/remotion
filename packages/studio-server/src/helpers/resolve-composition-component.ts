import fs from 'node:fs';
import path from 'node:path';
import {
	addElement,
	applyCodemodChanges,
	resolveCompositionComponent as resolveCompositionCodemod,
	getNodes,
	type CodemodEnvironment,
	type ResolvedCompositionComponent,
	type ResolvedCompositionComponentWithFile,
} from '@remotion/codemods';
import type {
	InsertableCompositionElement,
	InsertableCompositionElementPosition,
	SequenceNodePathRemapping,
} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import {svgMarkupToJsx} from './svg-to-jsx';

const makeCodemodEnvironment = (
	remotionRoot: string,
	sourceFileOverrides: ReadonlyMap<string, string> | null,
): CodemodEnvironment => ({
	dirname: path.dirname,
	extname: path.extname,
	fileExists: (fileName) =>
		sourceFileOverrides?.has(path.resolve(fileName)) === true ||
		(fs.existsSync(fileName) && fs.statSync(fileName).isFile()),
	isAbsolute: path.isAbsolute,
	join: path.join,
	pathSeparator: path.sep,
	readFile: (fileName) => {
		const override = sourceFileOverrides?.get(path.resolve(fileName));
		return override === undefined
			? fs.promises.readFile(fileName, 'utf-8')
			: Promise.resolve(override);
	},
	relative: path.relative,
	resolve: path.resolve,
	rootDir: remotionRoot,
	svgMarkupToJsx,
});

export type {
	ResolvedCompositionComponent,
	ResolvedCompositionComponentWithFile,
};

export const resolveCompositionComponentWithFile = async ({
	remotionRoot,
	compositionFile,
	compositionId,
}: {
	remotionRoot: string;
	compositionFile: string;
	compositionId: string;
}): Promise<ResolvedCompositionComponentWithFile> => {
	const result = await resolveCompositionCodemod({
		environment: makeCodemodEnvironment(remotionRoot, null),
		compositionFile,
		compositionId,
	});
	return {
		fileName: result.filePath,
		exportName: result.exportName,
		source: path.relative(remotionRoot, result.filePath),
		line: result.location.line,
		column: result.location.column,
		canAddSequence: result.canAddContent,
	};
};

export const resolveCompositionComponent = async (options: {
	remotionRoot: string;
	compositionFile: string;
	compositionId: string;
}): Promise<ResolvedCompositionComponent> => {
	const {
		fileName: _fileName,
		exportName: _exportName,
		...result
	} = await resolveCompositionComponentWithFile(options);
	return result;
};

export const insertJsxElementIntoComposition = async ({
	remotionRoot,
	compositionFile,
	compositionId,
	element,
	from,
	prettierConfigOverride,
	wrapInSequence = null,
	sourceFileOverrides,
}: {
	remotionRoot: string;
	compositionFile: string;
	compositionId: string;
	element: InsertableCompositionElement;
	from: number | null;
	prettierConfigOverride: Record<string, unknown> | null;
	wrapInSequence?: {
		dimensions: {width: number; height: number} | null;
		durationInFrames?: number | null;
		from: number | null;
		name: string | null;
		position: InsertableCompositionElementPosition | null;
	} | null;
	sourceFileOverrides: ReadonlyMap<string, string> | null;
}): Promise<{
	fileName: string;
	source: string;
	oldContents: string;
	output: string;
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
	insertedNodePath: SequenceNodePath | null;
}> => {
	const result = await addElement({
		environment: makeCodemodEnvironment(remotionRoot, sourceFileOverrides),
		element,
		from,
		wrapInSequence:
			wrapInSequence === null
				? null
				: {
						...wrapInSequence,
						durationInFrames: wrapInSequence.durationInFrames ?? null,
					},
		prettierConfigOverride,
		target: {type: 'composition', compositionFile, compositionId},
	});
	const change = result.changes.find(
		(item) => item.filePath === result.insertedNode.filePath,
	)!;
	const project = {
		rootDir: remotionRoot,
		files: {[change.filePath]: change.previousContents!},
	};
	const insertedNode = getNodes({
		project: applyCodemodChanges(project, result.changes),
		filePath: change.filePath,
	}).find(
		(node) =>
			JSON.stringify(node.nodePath) ===
			JSON.stringify(result.insertedNode.nodePath),
	);
	return {
		fileName: change.filePath,
		source: path.relative(remotionRoot, change.filePath),
		oldContents: change.previousContents!,
		output: change.nextContents!,
		logLine: insertedNode?.location?.line ?? 1,
		nodePathRemappings: result.nodePathRemappings.map(
			({oldNodePath, newNodePath}) => ({oldNodePath, newNodePath}),
		),
		insertedNodePath: result.insertedNode.nodePath,
	};
};
