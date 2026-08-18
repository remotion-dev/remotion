import fs from 'node:fs';
import path from 'node:path';
import {
	insertJsxElementIntoComposition as insertJsxElementIntoCompositionCodemod,
	resolveCompositionComponent as resolveCompositionComponentCodemod,
	resolveCompositionComponentWithFile as resolveCompositionComponentWithFileCodemod,
	type InsertJsxElementCodemodEnvironment,
	type ResolvedCompositionComponent,
	type ResolvedCompositionComponentWithFile,
} from '@remotion/studio-codemods';
import type {
	InsertableCompositionElement,
	InsertableCompositionElementPosition,
	SequenceNodePathRemapping,
} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import {formatFileContent} from '../codemods/format-file-content';
import {svgMarkupToJsx} from './svg-to-jsx';

const makeCodemodEnvironment = (
	remotionRoot: string,
): InsertJsxElementCodemodEnvironment => ({
	dirname: path.dirname,
	extname: path.extname,
	fileExists: (fileName) =>
		fs.existsSync(fileName) && fs.statSync(fileName).isFile(),
	formatFile: ({contents, prettierConfigOverride}) =>
		formatFileContent({input: contents, prettierConfigOverride}),
	isAbsolute: path.isAbsolute,
	join: path.join,
	pathSeparator: path.sep,
	readFile: (fileName) => fs.promises.readFile(fileName, 'utf-8'),
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
		environment: makeCodemodEnvironment(remotionRoot),
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
		environment: makeCodemodEnvironment(remotionRoot),
	});

export const insertJsxElementIntoComposition = ({
	remotionRoot,
	compositionFile,
	compositionId,
	element,
	from,
	prettierConfigOverride,
	wrapInSequence = null,
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
}): Promise<{
	fileName: string;
	source: string;
	oldContents: string;
	output: string;
	formatted: boolean;
	logLine: number;
	nodePathRemappings: SequenceNodePathRemapping[];
	insertedNodePath: SequenceNodePath | null;
}> =>
	insertJsxElementIntoCompositionCodemod({
		compositionFile,
		compositionId,
		element,
		environment: makeCodemodEnvironment(remotionRoot),
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
