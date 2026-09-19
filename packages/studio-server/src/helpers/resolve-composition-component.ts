import fs from 'node:fs';
import path from 'node:path';
import {
	CodemodInternals,
	type InsertJsxElementCodemodEnvironment,
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
	insertJsxElementIntoComposition: insertJsxElementIntoCompositionCodemod,
	resolveCompositionComponent: resolveCompositionComponentCodemod,
	resolveCompositionComponentWithFile:
		resolveCompositionComponentWithFileCodemod,
} = CodemodInternals;

const makeCodemodEnvironment = (
	remotionRoot: string,
	sourceFileOverrides: ReadonlyMap<string, string> | null,
): InsertJsxElementCodemodEnvironment => ({
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

export const insertJsxElementIntoComposition = ({
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
}> =>
	insertJsxElementIntoCompositionCodemod({
		compositionFile,
		compositionId,
		element,
		environment: makeCodemodEnvironment(remotionRoot, sourceFileOverrides),
		from,
		prettierConfigOverride,
		wrapInSequence:
			wrapInSequence === null
				? null
				: {
						dimensions: wrapInSequence.dimensions,
						durationInFrames: wrapInSequence.durationInFrames ?? null,
						from: wrapInSequence.from,
						name: wrapInSequence.name,
						position: wrapInSequence.position,
					},
	});
