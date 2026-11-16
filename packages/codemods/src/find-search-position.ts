import type {JSXElement, Node} from '@babel/types';
import * as recast from 'recast';
import {getCssShorthandForLonghand} from './sequence-props/css-shorthand-properties';
import {parseAstForReadOnly} from './sequence-props/parse-ast';

export const findSearchPosition = ({
	contents,
	lineNumber,
	columnNumber,
	search,
	effectIndex,
}: {
	contents: string;
	lineNumber: number;
	columnNumber: number;
	search: string | null;
	effectIndex: number | null;
}) => {
	const fallback = {lineNumber, columnNumber};
	if (search === null && effectIndex === null) return fallback;

	const ast = parseAstForReadOnly(contents);
	let element: JSXElement | null = null;
	recast.types.visit(ast, {
		visitJSXElement(path) {
			const candidate = path.node as JSXElement;
			const {loc} = candidate.openingElement;
			const column = Math.max(0, columnNumber - 1);
			if (
				loc &&
				loc.start.line === lineNumber &&
				(loc.end.line > lineNumber || loc.end.column >= column) &&
				(element === null ||
					Math.abs(loc.start.column - column) <
						Math.abs(element.openingElement.loc!.start.column - column))
			) {
				element = candidate;
			}

			this.traverse(path);
		},
	});

	const jsx = element as JSXElement | null;
	if (jsx === null) return fallback;
	let target: Node = jsx.openingElement;
	const keys = search === null ? [] : search.split('.');
	const attributeName = effectIndex === null ? keys.shift() : 'effects';
	if (attributeName === 'children' && effectIndex === null) {
		const child = jsx.children.find(
			(node) => node.type !== 'JSXText' || node.value.trim() !== '',
		);
		if (child) target = child;
	} else {
		const attribute = [...jsx.openingElement.attributes]
			.reverse()
			.find(
				(node) =>
					node.type === 'JSXAttribute' &&
					node.name.type === 'JSXIdentifier' &&
					node.name.name === attributeName,
			);
		if (!attribute || attribute.type !== 'JSXAttribute') return fallback;
		target = attribute;
		let expression: Node | null | undefined =
			attribute.value?.type === 'JSXExpressionContainer'
				? attribute.value.expression
				: attribute.value;
		if (effectIndex !== null) {
			if (expression?.type !== 'ArrayExpression') {
				return {
					lineNumber: target.loc!.start.line,
					columnNumber: target.loc!.start.column + 1,
				};
			}

			const entry = expression.elements[effectIndex];
			if (entry) {
				target = entry;
				expression =
					entry.type === 'CallExpression' ? entry.arguments[0] : null;
			} else {
				expression = null;
			}
		}

		for (const [index, key] of keys.entries()) {
			if (expression?.type !== 'ObjectExpression') break;
			const shorthand =
				effectIndex === null
					? getCssShorthandForLonghand({
							parentKey: [attributeName, ...keys.slice(0, index)].join('.'),
							longhand: key,
						})
					: null;
			const property: Node | undefined = [...expression.properties]
				.reverse()
				.find((node) => {
					if (node.type !== 'ObjectProperty' || node.computed) return false;
					const name =
						node.key.type === 'Identifier'
							? node.key.name
							: node.key.type === 'StringLiteral'
								? node.key.value
								: null;
					return name === key || name === shorthand?.shorthand;
				});
			if (!property || property.type !== 'ObjectProperty') break;
			target = property;
			expression = property.value;
		}
	}

	return target.loc
		? {
				lineNumber: target.loc.start.line,
				columnNumber: target.loc.start.column + 1,
			}
		: fallback;
};
