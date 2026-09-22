import type {JSXElement, JSXOpeningElement} from '@babel/types';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {recastLocToOffset} from './recast-loc-to-offset';
import {
	getSourceFormattingConfig,
	normalizePrintedIndentation,
} from './source-style';

const identifierRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;

export const captureJsxAttributeSources = (
	node: JSXElement | JSXOpeningElement,
): Map<object, string> => {
	const sources = new Map<object, string>();
	recast.types.visit(node, {
		visitJSXOpeningElement(path) {
			for (const attribute of path.node.attributes ?? []) {
				sources.set(attribute, recast.print(attribute).code);
			}

			this.traverse(path);
		},
	});
	return sources;
};

const escapeJsxStringAttribute = (value: string) => {
	return value.replace(/[&"<>{}\t\r\n]/g, (character) => {
		switch (character) {
			case '&':
				return '&amp;';
			case '"':
				return '&quot;';
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '{':
				return '&#123;';
			case '}':
				return '&#125;';
			case '\t':
				return '&#9;';
			case '\r':
				return '&#13;';
			case '\n':
				return '&#10;';
			default:
				throw new Error(`Unexpected JSX attribute character: ${character}`);
		}
	});
};

export const indentInsertedJsx = ({
	indent,
	insertion,
}: {
	indent: string;
	insertion: string;
}) => {
	return insertion
		.split(/\r?\n/)
		.map((line) => (line.length === 0 ? line : `${indent}${line}`))
		.join(insertion.includes('\r\n') ? '\r\n' : '\n');
};

export const printInsertedJsx = ({
	element,
	input,
	originalAttributeSources,
	prettierConfigOverride,
}: {
	element: namedTypes.JSXElement | namedTypes.JSXFragment;
	input: string;
	originalAttributeSources?: ReadonlyMap<object, string>;
	prettierConfigOverride: Record<string, unknown> | null;
}): string => {
	const formattingConfig = getSourceFormattingConfig({
		input,
		prettierConfigOverride,
	});
	const {
		endOfLine,
		indentationUnit: unit,
		printWidth,
		tabWidth,
	} = formattingConfig;
	const printNode = (printableNode: namedTypes.Node, wrapColumn: number) => {
		recast.types.visit(printableNode, {
			visitObjectProperty(path) {
				const {node} = path;
				if (
					!node.computed &&
					node.key.type === 'StringLiteral' &&
					identifierRegex.test(node.key.value)
				) {
					node.key = recast.types.builders.identifier(node.key.value);
				}

				this.traverse(path);
				return undefined;
			},
		});
		// The generic printer drops comments inside empty JSX expressions.
		if (
			printableNode.type === 'JSXExpressionContainer' &&
			(printableNode as namedTypes.JSXExpressionContainer).expression.type ===
				'JSXEmptyExpression'
		) {
			return recast.print(printableNode).code;
		}

		return recast.prettyPrint(printableNode, {
			objectCurlySpacing: formattingConfig.bracketSpacing,
			quote: formattingConfig.quote,
			tabWidth,
			useTabs: false,
			wrapColumn,
		}).code;
	};

	const normalizeIndentation = (code: string) => {
		return normalizePrintedIndentation({
			endOfLine,
			indentationUnit: unit,
			printed: code,
			tabWidth,
		});
	};

	const printOpeningElement = (opening: namedTypes.JSXOpeningElement) => {
		const name = printNode(opening.name, printWidth);
		const attributes = (opening.attributes ?? []).map((attribute) => {
			const originalAttributeSource = originalAttributeSources?.get(attribute);
			if (
				originalAttributeSource === recast.print(attribute).code &&
				attribute.loc
			) {
				const start = recastLocToOffset(input, attribute.loc.start);
				const end = recastLocToOffset(input, attribute.loc.end);
				const original = input.slice(start, end);
				const lines = original.split(/\r?\n/);
				const nonBlankContinuationLines = lines
					.slice(1)
					.filter((line) => line.trim().length > 0);
				let commonIndent =
					nonBlankContinuationLines[0]?.match(/^\s*/)?.[0] ?? '';
				for (const line of nonBlankContinuationLines.slice(1)) {
					const indent = line.match(/^\s*/)?.[0] ?? '';
					while (!indent.startsWith(commonIndent)) {
						commonIndent = commonIndent.slice(0, -1);
					}
				}

				return lines
					.map((line, index) => {
						if (line.trim().length === 0) {
							return '';
						}

						return index === 0 ? line : line.slice(commonIndent.length);
					})
					.join(endOfLine);
			}

			if (
				attribute.type === 'JSXAttribute' &&
				attribute.name.type === 'JSXIdentifier' &&
				attribute.value?.type === 'StringLiteral'
			) {
				return `${attribute.name.name}="${escapeJsxStringAttribute(attribute.value.value)}"`;
			}

			const unwrapped = normalizeIndentation(
				printNode(attribute, Number.POSITIVE_INFINITY),
			);
			return !unwrapped.includes(endOfLine) && unwrapped.length <= printWidth
				? unwrapped
				: normalizeIndentation(printNode(attribute, printWidth));
		});
		const suffix = opening.selfClosing ? ' />' : '>';
		const singleLine = `<${name}${attributes.length === 0 ? '' : ` ${attributes.join(' ')}`}${suffix}`;
		if (
			!attributes.some((attribute) => attribute.includes(endOfLine)) &&
			singleLine.length <= printWidth
		) {
			return singleLine;
		}

		return [
			`<${name}`,
			...attributes.map((attribute) =>
				indentInsertedJsx({indent: unit, insertion: attribute}),
			),
			opening.selfClosing ? '/>' : '>',
		].join(endOfLine);
	};

	const printElement = (
		node: namedTypes.JSXElement | namedTypes.JSXFragment,
	): string => {
		if (node.type === 'JSXFragment') {
			const fragmentChildren = (node.children ?? []).flatMap((child) => {
				if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
					return [printElement(child)];
				}

				if (child.type === 'JSXText' && child.value.trim() === '') {
					return [];
				}

				return [normalizeIndentation(printNode(child, printWidth))];
			});
			return [
				'<>',
				...fragmentChildren.map((child) =>
					indentInsertedJsx({indent: unit, insertion: child}),
				),
				'</>',
			].join(endOfLine);
		}

		const opening = printOpeningElement(node.openingElement);
		if (node.openingElement.selfClosing) {
			return opening;
		}

		const closing = node.closingElement
			? normalizeIndentation(printNode(node.closingElement, printWidth))
			: '';
		const children = node.children ?? [];
		if (
			children.length === 1 &&
			children[0].type === 'JSXText' &&
			!children[0].value.includes('\n')
		) {
			return `${opening}${children[0].value}${closing}`;
		}

		if (
			children.length === 1 &&
			children[0].type === 'JSXExpressionContainer' &&
			children[0].expression.type === 'StringLiteral'
		) {
			return `${opening}${normalizeIndentation(
				printNode(children[0], printWidth),
			)}${closing}`;
		}

		const printedChildren = children.flatMap((child) => {
			if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
				return [printElement(child)];
			}

			if (child.type === 'JSXText' && child.value.trim() === '') {
				return [];
			}

			return [normalizeIndentation(printNode(child, printWidth))];
		});
		if (printedChildren.length === 0) {
			return `${opening}${closing}`;
		}

		return [
			opening,
			...printedChildren.map((child) =>
				indentInsertedJsx({indent: unit, insertion: child}),
			),
			closing,
		].join(endOfLine);
	};

	return printElement(element);
};

export const printJsxOpeningElement = ({
	openingElement,
	input,
	originalAttributeSources,
	prettierConfigOverride,
}: {
	openingElement: namedTypes.JSXOpeningElement;
	input: string;
	originalAttributeSources?: ReadonlyMap<object, string>;
	prettierConfigOverride: Record<string, unknown> | null;
}): string => {
	const wasSelfClosing = openingElement.selfClosing ?? false;
	const printableOpeningElement = {
		...openingElement,
		selfClosing: true,
	};
	const printableElement = recast.types.builders.jsxElement(
		printableOpeningElement,
		null,
		[],
	);
	const printed = printInsertedJsx({
		element: printableElement,
		input,
		originalAttributeSources,
		prettierConfigOverride,
	});
	if (wasSelfClosing) {
		return printed;
	}

	if (!printed.endsWith('/>')) {
		throw new Error('Expected a printed self-closing JSX element');
	}

	const slashIndex = printed.length - 2;
	const lastLineStart = printed.lastIndexOf('\n') + 1;
	const beforeSlash = printed.slice(lastLineStart, slashIndex);
	return beforeSlash.trim().length === 0
		? `${printed.slice(0, slashIndex)}>`
		: `${printed.slice(0, slashIndex).trimEnd()}>`;
};
