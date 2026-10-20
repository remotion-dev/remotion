import type {JSXElement} from '@babel/types';
import type {CodemodProject} from './codemod-project';
import {
	type CompositionTarget,
	requireComposition,
	assertNewCompositionId,
} from './composition-editing';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
	type CodemodNodeResult,
	type NodeReference,
} from './node-references';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	getJsxStringAttributeValueSourceEdit,
} from './source-edits';

export type RenameCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {project: Project; newId: string};

export const renameComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	newId,
}: RenameCompositionOptions<Project>): CodemodNodeResult & {
	updatedNode: NodeReference;
} => {
	const node = requireComposition({project, compositionFile, compositionId});
	const reference = {filePath: node.filePath, nodePath: node.nodePath};
	if (newId === compositionId) {
		return {changes: [], nodePathRemappings: [], updatedNode: reference};
	}

	assertNewCompositionId({project, compositionFile, compositionId: newId});
	const input = project.files[node.filePath];
	const ast = parseAst(input);
	const element = findJsxElementPathForDeletion(ast, node.nodePath)?.node as
		| JSXElement
		| undefined;
	const attribute = element?.openingElement.attributes.find(
		(attr) =>
			attr.type === 'JSXAttribute' &&
			attr.name.type === 'JSXIdentifier' &&
			attr.name.name === 'id',
	);
	if (attribute?.type !== 'JSXAttribute') {
		throw new Error('Could not locate the composition id');
	}

	const output = applySourceEdits({
		input,
		edits: [
			getJsxStringAttributeValueSourceEdit({attribute, input, newValue: newId}),
		],
	});
	const result = getNodeEditResult({
		project,
		edits: [
			{
				filePath: node.filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({input, output}),
			},
		],
	});
	return {
		...result,
		updatedNode: getUpdatedNodeReference({
			project,
			node: reference,
			nodePathRemappings: result.nodePathRemappings,
		}),
	};
};
