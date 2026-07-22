import {transform} from '@svgr/core';
import jsxPlugin from '@svgr/plugin-jsx';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {parseAst} from '../codemods/parse-ast';

export const svgMarkupToJsx = async (
	markup: string,
): Promise<namedTypes.JSXElement> => {
	const componentCode = await transform(
		markup,
		{
			expandProps: false,
			jsxRuntime: 'automatic',
			plugins: [jsxPlugin],
			prettier: false,
			typescript: true,
		},
		{componentName: 'PastedSvg'},
	);
	const ast = parseAst(componentCode);
	let svgElement: namedTypes.JSXElement | null = null;

	recast.types.visit(ast, {
		visitJSXElement(path) {
			const {name} = path.node.openingElement;
			if (name.type === 'JSXIdentifier' && name.name === 'svg') {
				svgElement = path.node;
				return false;
			}

			this.traverse(path);
			return undefined;
		},
	});

	if (svgElement === null) {
		throw new Error('The pasted markup does not contain an <svg> root element');
	}

	return svgElement;
};
