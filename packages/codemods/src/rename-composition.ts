import type {JSXElement} from '@babel/types';
import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {
	type CompositionTarget,
	requireComposition,
	assertNewCompositionId,
} from './composition-editing';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
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
}: RenameCompositionOptions<Project>): CodemodResult<Project> => {
	const node = requireComposition({project, compositionFile, compositionId});
	if (newId === compositionId) {
		return getCodemodResult({project, nextProject: project});
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
	return getCodemodResult({
		project,
		nextProject: {
			...project,
			files: {...project.files, [node.filePath]: output},
		},
	});
};
