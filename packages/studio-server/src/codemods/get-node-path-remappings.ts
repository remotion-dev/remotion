import {CodemodsInternals} from '@remotion/codemods';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {getNodePathForRecastPath} from '../preview-server/routes/can-update-sequence-props';
import {parseAst} from './parse-ast';

export type CapturedJsxNodePath = {
	nodePath: SequenceNodePath;
	location: {line: number; column: number} | null;
};

export const captureJsxNodePaths = (source: string): CapturedJsxNodePath[] => {
	const ast = parseAst(source);
	const captured: CapturedJsxNodePath[] = [];
	recast.visit(ast, {
		visitJSXOpeningElement(path) {
			captured.push({
				nodePath: getNodePathForRecastPath(path, ast),
				location: path.node.loc
					? CodemodsInternals.getJsxSourceLocation(source, path.node.loc.start)
					: null,
			});
			return this.traverse(path);
		},
	});

	return captured;
};
