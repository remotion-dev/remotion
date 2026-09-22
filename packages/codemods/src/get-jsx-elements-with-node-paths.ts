import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {getNodePathForRecastPath} from './sequence-props';
import {parseAst} from './sequence-props/parse-ast';

type JsxName =
	| {type: 'JSXIdentifier'; name: string}
	| {
			type: 'JSXMemberExpression';
			object: JsxName;
			property: {name: string};
	  };

const jsxNameToString = (name: JsxName): string => {
	if (name.type === 'JSXIdentifier') {
		return name.name;
	}

	return `${jsxNameToString(name.object)}.${name.property.name}`;
};

export const getJsxElementsWithNodePaths = ({source}: {source: string}) => {
	const ast = parseAst(source);
	const elements: {tagName: string; nodePath: SequenceNodePath}[] = [];
	recast.visit(ast, {
		visitJSXOpeningElement(path) {
			const {name} = path.node;
			if (name.type !== 'JSXNamespacedName') {
				elements.push({
					tagName: jsxNameToString(name as JsxName),
					nodePath: getNodePathForRecastPath(path, ast),
				});
			}

			return this.traverse(path);
		},
	});

	return elements;
};
