import * as recast from 'recast';
import type {JsxComponentIdentity, SequenceNodePath} from 'remotion';
import type {CodemodProject} from './codemod-project';
import {getJsxNodesWithPaths} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import type {NodeReference} from './node-references';
import {recastLocToOffset} from './recast-loc-to-offset';
import {getReadOnlySourceSnapshot} from './sequence-props-snapshot';
import {getJsxComponentIdentity} from './sequence-props/jsx-component-identity';

export type CodemodNode = NodeReference & {
	tagName: string;
	componentIdentity: JsxComponentIdentity | null;
	location: {line: number; column: number} | null;
	parentNodePath: SequenceNodePath | null;
};

export type GetNodesOptions = {
	project: CodemodProject;
	filePath: string;
};

export const getNodes = ({
	project,
	filePath,
}: GetNodesOptions): CodemodNode[] => {
	const resolvedFilePath = findProjectFile({project, filePath});
	const input = project.files[resolvedFilePath];
	const {ast} = getReadOnlySourceSnapshot(input);
	const captured = getJsxNodesWithPaths(ast);
	const nodePathByNode = new Map(
		captured.map(({node, nodePath}) => [node, nodePath]),
	);
	// Index source lines once instead of splitting the prefix for every JSX node.
	const lineStarts = [0];
	for (const match of input.matchAll(/\r\n|[\r\n\u2028\u2029]/g)) {
		lineStarts.push(match.index + match[0].length);
	}

	return captured.map(({node, nodePath, parentNode}) => {
		const offset = node.loc ? recastLocToOffset(input, node.loc.start) : null;
		return {
			filePath: resolvedFilePath,
			nodePath,
			tagName: recast.print(node.name).code,
			componentIdentity: getJsxComponentIdentity({ast, jsxElement: node}),
			location:
				node.loc && offset !== null
					? {
							line: node.loc.start.line,
							column: offset - lineStarts[node.loc.start.line - 1],
						}
					: null,
			parentNodePath:
				parentNode === null ? null : (nodePathByNode.get(parentNode) ?? null),
		};
	});
};
