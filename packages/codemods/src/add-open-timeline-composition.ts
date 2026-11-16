import {addComposition} from './add-composition';
import type {CodemodProject} from './codemod-project';
import type {CompositionTarget, FolderReference} from './composition-editing';
import {findProjectFile} from './internals';
import type {CodemodInsertionResult} from './node-references';
import {
	generateOpenTimelineComposition,
	type OpenTimelineAnnotation,
	type OpenTimelineAsset,
	type OpenTimelineDiagnostic,
	type OpenTimelineMediaResolver,
} from './open-timeline/generate';
import {parseAst} from './sequence-props/parse-ast';

export type AddOpenTimelineCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		component: {filePath: string; importName: string; importPath: string};
		timeline: unknown;
		fps: number;
		width: number;
		height: number;
		folder?: FolderReference;
		resolveMedia?: OpenTimelineMediaResolver;
	};

export type AddOpenTimelineCompositionResult = CodemodInsertionResult & {
	diagnostics: OpenTimelineDiagnostic[];
	assets: OpenTimelineAsset[];
	annotations: OpenTimelineAnnotation[];
	globalStartTime: {value: number; rate: number} | null;
};

export class OpenTimelineImportError extends Error {
	readonly diagnostics: OpenTimelineDiagnostic[];

	constructor(diagnostics: OpenTimelineDiagnostic[]) {
		super(
			`Cannot import OpenTimelineIO timeline:\n${diagnostics
				.filter((diagnostic) => diagnostic.severity === 'error')
				.map((diagnostic) => `${diagnostic.path}: ${diagnostic.message}`)
				.join('\n')}`,
		);
		this.name = 'OpenTimelineImportError';
		this.diagnostics = diagnostics;
	}
}

export const addOpenTimelineComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	component,
	timeline,
	fps,
	width,
	height,
	folder,
	resolveMedia,
}: AddOpenTimelineCompositionOptions<Project>): AddOpenTimelineCompositionResult => {
	let existingComponentFile: string | null = null;
	try {
		existingComponentFile = findProjectFile({
			project,
			filePath: component.filePath,
		});
	} catch {
		// The component is created only when no equivalent project path exists.
	}

	if (existingComponentFile !== null) {
		throw new Error(
			`Cannot create ${existingComponentFile} because it already exists`,
		);
	}

	const generated = generateOpenTimelineComposition({
		timeline,
		componentName: component.importName,
		fps,
		width,
		height,
		resolveMedia,
	});
	if (generated.source === null || generated.metadata === null) {
		throw new OpenTimelineImportError(generated.diagnostics);
	}

	parseAst(generated.source);
	const result = addComposition({
		project,
		compositionFile,
		compositionId,
		component,
		metadata: generated.metadata,
		folder,
	});

	return {
		...result,
		diagnostics: generated.diagnostics,
		assets: generated.assets,
		annotations: generated.annotations,
		globalStartTime: generated.globalStartTime,
		changes: [
			...result.changes,
			{
				filePath: component.filePath,
				previousContents: null,
				nextContents: generated.source,
			},
		],
	};
};
