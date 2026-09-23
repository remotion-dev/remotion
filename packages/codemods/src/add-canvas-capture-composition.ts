import type {JSXElement} from '@babel/types';
import type {CanvasCaptureData} from '@remotion/studio-shared';
import * as recast from 'recast';
import {
	getCodemodResult,
	type CodemodProject,
	type CodemodResult,
} from './codemod-project';
import {
	assertNewCompositionId,
	validateMetadata,
	type CompositionTarget,
	type CompositionMetadata,
	type FolderReference,
} from './composition-editing';
import {generateCanvasCaptureComposition} from './generate-canvas-capture-composition';
import {findProjectFile} from './internals';
import {getRegistrationInsertionSourceEdit} from './registration-source-edits';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
} from './source-edits';

export type AddCanvasCaptureCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		component: {filePath: string; importName: string; importPath: string};
		metadata: CompositionMetadata;
		folder?: FolderReference;
		capture: {
			data: CanvasCaptureData;
			keyframeFps: number;
			videoFileName: string;
			videoHeight: number;
			videoWidth: number;
		};
	};

export const addCanvasCaptureComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	component,
	metadata,
	folder,
	capture,
}: AddCanvasCaptureCompositionOptions<Project>): CodemodResult => {
	assertNewCompositionId({project, compositionFile, compositionId});
	validateMetadata(metadata);
	if (!/^[A-Z_$][\w$]*$/.test(component.importName)) {
		throw new Error(
			'component.importName must be a named component export beginning with an uppercase letter, _ or $',
		);
	}

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

	const filePath = findProjectFile({project, filePath: compositionFile});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const snapshots = captureImportSnapshots(ast);
	const componentName = ensureNamedImport({
		ast,
		importedName: component.importName,
		sourcePath: component.importPath,
		localName: component.importName,
	});
	const b = recast.types.builders;
	const insertion = b.jsxElement(
		b.jsxOpeningElement(b.jsxIdentifier(componentName), [], true),
		null,
		[],
	);
	const output = applySourceEdits({
		input,
		edits: [
			getRegistrationInsertionSourceEdit({
				input,
				ast,
				insertion: insertion as JSXElement,
				folder: folder ?? null,
			}),
			...getInsertImportSourceEdits({
				ast,
				input,
				snapshots,
				prettierConfigOverride: null,
			}),
		],
	});
	const componentSource = generateCanvasCaptureComposition({
		componentName: component.importName,
		compositionId,
		...metadata,
		...capture,
	});
	parseAst(output);
	parseAst(componentSource);
	return getCodemodResult({
		project,
		edits: [
			{filePath, nextContents: output},
			{filePath: component.filePath, nextContents: componentSource},
		],
	});
};
