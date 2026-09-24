import * as recast from 'recast';
import type {JsxComponentIdentity} from 'remotion';
import type {CodemodProject} from './codemod-project';
import {captureJsxNodePaths} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import type {JsxNodeReference} from './node-references';
import {recastLocToOffset} from './recast-loc-to-offset';
import {getReadOnlySourceSnapshot} from './sequence-props-snapshot';
import {getJsxComponentIdentity} from './sequence-props/jsx-component-identity';

export type JsxNode = JsxNodeReference & {
	tagName: string;
	componentIdentity: JsxComponentIdentity | null;
	location: {line: number; column: number} | null;
};

export type GetJsxNodesOptions = {
	project: CodemodProject;
	filePath: string;
};

export const getJsxNodes = ({
	project,
	filePath,
}: GetJsxNodesOptions): JsxNode[] => {
	const resolvedFilePath = findProjectFile({project, filePath});
	const input = project.files[resolvedFilePath];
	const {ast} = getReadOnlySourceSnapshot(input);
	return captureJsxNodePaths(ast).map(({node, nodePath}) => {
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
							column: input
								.slice(0, offset)
								.split(/\r\n|[\r\n\u2028\u2029]/)
								.at(-1)!.length,
						}
					: null,
		};
	});
};
