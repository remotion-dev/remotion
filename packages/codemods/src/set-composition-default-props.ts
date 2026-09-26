import type {JSXElement} from '@babel/types';
import {stringifyDefaultProps, type EnumPath} from '@remotion/studio-shared';
import type {CodemodProject} from './codemod-project';
import type {CodemodValue} from './codemod-value';
import {
	type CompositionTarget,
	requireComposition,
} from './composition-editing';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {formatSerializedValue} from './format-serialized-value';
import {getNodeProps} from './get-node-props';
import {
	getNodeEditResult,
	getUnchangedStructureRemappings,
	getUpdatedNodeReference,
} from './node-references';
import {recastLocToOffset} from './recast-loc-to-offset';
import {parseAst} from './sequence-props/parse-ast';
import {updateNodeProps} from './update-node-props';

export type SetCompositionDefaultPropsOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		defaultProps: Record<string, CodemodValue>;
		enumPaths?: EnumPath[];
	};

export const setCompositionDefaultProps = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	defaultProps,
	enumPaths,
}: SetCompositionDefaultPropsOptions<Project>) => {
	const node = requireComposition({project, compositionFile, compositionId});
	const status = getNodeProps({
		project,
		node,
		keys: ['defaultProps'],
		assetKeys: ['defaultProps'],
	}).props.defaultProps;
	if (status.status === 'computed') {
		throw new Error('Cannot update computed prop "defaultProps"');
	}

	let input = project.files[node.filePath];
	let element = findJsxElementPathForDeletion(parseAst(input), node.nodePath)
		?.node as JSXElement | undefined;
	const logLine = element?.openingElement.loc?.start.line ?? 1;
	let attribute = element?.openingElement.attributes.find(
		(attr) =>
			attr.type === 'JSXAttribute' &&
			attr.name.type === 'JSXIdentifier' &&
			attr.name.name === 'defaultProps',
	);
	if (!attribute || (attribute.type === 'JSXAttribute' && !attribute.value)) {
		const inserted = updateNodeProps({
			project,
			node,
			props: {defaultProps: {}},
		});
		input =
			inserted.changes.find((change) => change.filePath === node.filePath)
				?.nextContents ?? input;
		element = findJsxElementPathForDeletion(
			parseAst(input),
			inserted.updatedNode.nodePath,
		)?.node as JSXElement | undefined;
		attribute = element?.openingElement.attributes.find(
			(attr) =>
				attr.type === 'JSXAttribute' &&
				attr.name.type === 'JSXIdentifier' &&
				attr.name.name === 'defaultProps',
		);
	}

	if (
		attribute?.type !== 'JSXAttribute' ||
		attribute.value?.type !== 'JSXExpressionContainer' ||
		!attribute.value.loc
	) {
		throw new Error('Could not locate the defaultProps expression');
	}

	const serialized = stringifyDefaultProps({
		props: defaultProps,
		enumPaths: enumPaths ?? [],
	});
	if (serialized === undefined) {
		throw new Error('Could not serialize the updated defaultProps value');
	}

	const start = recastLocToOffset(input, attribute.value.loc.start);
	const end = recastLocToOffset(input, attribute.value.loc.end);
	const lineStart = input.lastIndexOf('\n', start) + 1;
	const formatted = formatSerializedValue({
		input,
		linePrefix: input.slice(lineStart, start + 1),
		previousValue: input.slice(start + 1, end - 1).trim(),
		serialized,
	});
	const output =
		input.slice(0, start) + '{' + formatted + '}' + input.slice(end);
	const result = getNodeEditResult({
		project,
		edits: [
			{
				filePath: node.filePath,
				output,
				nodePathRemappings: getUnchangedStructureRemappings({
					input: project.files[node.filePath],
					output,
				}),
			},
		],
	});
	return {
		...result,
		logLine,
		updatedNode: getUpdatedNodeReference({project, ...result, node}),
	};
};
