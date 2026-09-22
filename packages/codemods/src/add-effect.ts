import type {CodemodProject} from './codemod-project';
import type {CodemodValue} from './codemod-value';
import {addEffect as addEffectInSource} from './effect-operations';
import {getEffectSource} from './effect-references';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
	type JsxNodeReference,
} from './node-references';

export type AddEffectOptions<Project extends CodemodProject> = {
	project: Project;
	node: JsxNodeReference;
	importName: string;
	importPath: string;
	props?: Record<string, CodemodValue>;
};

export const addEffect = async <Project extends CodemodProject>({
	project,
	node,
	importName,
	importPath,
	props = {},
}: AddEffectOptions<Project>) => {
	const {filePath, input, length} = getEffectSource({project, node});
	const {output} = await addEffectInSource({
		input,
		sequenceNodePath: node.nodePath,
		effectName: importName,
		effectImportPath: importPath,
		effectConfig: props,
	});
	const result = getNodeEditResult({
		project,
		edits: [
			{
				filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			},
		],
	});
	return {
		...result,
		insertedEffect: {
			...getUpdatedNodeReference({...result, node}),
			effectIndex: length,
		},
	};
};
