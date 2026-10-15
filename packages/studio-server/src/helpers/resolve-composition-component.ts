import fs from 'node:fs';
import path from 'node:path';
import {
	addElement,
	applyCodemodChanges,
	CodemodsInternals,
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

const {
	createElementFromInsertable,
	insertJsxElementIntoComposition: insertJsxElementIntoCompositionCodemod,
	resolveCompositionComponent: resolveCompositionComponentCodemod,
	resolveCompositionComponentWithFile:
		resolveCompositionComponentWithFileCodemod,
} = CodemodsInternals;

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

export const resolveCompositionComponentWithFile = ({
	remotionRoot,
	compositionFile,
	compositionId,
}: {
	remotionRoot: string;
	compositionFile: string;
	compositionId: string;
}): Promise<ResolvedCompositionComponentWithFile> =>
	resolveCompositionComponentWithFileCodemod({
		compositionFile,
		compositionId,
		environment: makeCodemodEnvironment(remotionRoot, null),
	});

export const resolveCompositionComponent = ({
	remotionRoot,
	compositionFile,
	compositionId,
}: {
	remotionRoot: string;
	compositionFile: string;
	compositionId: string;
}): Promise<ResolvedCompositionComponent> =>
	resolveCompositionComponentCodemod({
		compositionFile,
		compositionId,
		environment: makeCodemodEnvironment(remotionRoot, null),
	});

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
	const environment = makeCodemodEnvironment(remotionRoot, sourceFileOverrides);
	const sequence =
		wrapInSequence === null
			? null
			: {
					dimensions: wrapInSequence.dimensions,
					durationInFrames: wrapInSequence.durationInFrames ?? null,
					from: wrapInSequence.from,
					name: wrapInSequence.name,
					position: wrapInSequence.position,
				};
	// SVG markup and compositions need the file-system aware pipeline.
	if (element.type === 'svg' || element.type === 'composition') {
		return insertJsxElementIntoCompositionCodemod({
			compositionFile,
			compositionId,
			element,
			environment,
			from,
			prettierConfigOverride,
			wrapInSequence: sequence,
		});
	}

	const codemodElement = createElementFromInsertable({
		element,
		from,
		wrapInSequence: sequence,
	});
	const location = await resolveCompositionComponentWithFileCodemod({
		compositionFile,
		compositionId,
		environment,
	});
	if (!location.canAddSequence) {
		throw new Error(
			'Cannot insert JSX element into this composition component',
		);
	}

	const oldContents = await environment.readFile(location.fileName);
	const project = {
		rootDir: remotionRoot,
		files: {[location.fileName]: oldContents},
	};
	const result = addElement({
		project,
		element: codemodElement,
		target: {
			type: 'component',
			filePath: location.fileName,
			exportName: location.exportName,
		},
		prettierConfigOverride,
	});
	const nextProject = applyCodemodChanges(project, result.changes);
	const insertedNode = getNodes({
		project: nextProject,
		filePath: location.fileName,
	}).find(
		(node) =>
			JSON.stringify(node.nodePath) ===
			JSON.stringify(result.insertedNode.nodePath),
	);

	return {
		fileName: location.fileName,
		source: location.source,
		oldContents,
		output: nextProject.files[location.fileName],
		logLine: insertedNode?.location?.line ?? 1,
		nodePathRemappings: result.nodePathRemappings.map(
			({oldNodePath, newNodePath}) => ({oldNodePath, newNodePath}),
		),
		insertedNodePath: result.insertedNode.nodePath,
	};
};
