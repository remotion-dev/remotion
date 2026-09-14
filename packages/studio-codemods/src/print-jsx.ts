import type {namedTypes} from 'ast-types';
import * as recast from 'recast';

const identifierRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;

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

export const getPreferredQuote = (
	input: string,
	prettierConfigOverride: Record<string, unknown> | null,
) => {
	if (typeof prettierConfigOverride?.singleQuote === 'boolean') {
		return prettierConfigOverride.singleQuote ? 'single' : 'double';
	}

	const importQuote =
		input.match(/\bfrom\s+(['"])/)?.[1] ??
		input.match(/^\s*import\s+(['"])/m)?.[1];
	if (importQuote) {
		return importQuote === "'" ? 'single' : 'double';
	}

	const singleQuotedStrings = input.match(/'(?:\\.|[^'\\])*'/g)?.length ?? 0;
	const doubleQuotedStrings = input.match(/"(?:\\.|[^"\\])*"/g)?.length ?? 0;
	return singleQuotedStrings > doubleQuotedStrings ? 'single' : 'double';
};

export const getObjectCurlySpacing = (
	input: string,
	prettierConfigOverride: Record<string, unknown> | null,
) => {
	if (typeof prettierConfigOverride?.bracketSpacing === 'boolean') {
		return prettierConfigOverride.bracketSpacing;
	}

	const namedImport = input.match(/\bimport\s*{([^}\n]*)}/);
	if (namedImport) {
		return /^\s/.test(namedImport[1]) && /\s$/.test(namedImport[1]);
	}

	return true;
};

export const getIndentationUnit = (
	input: string,
	prettierConfigOverride: Record<string, unknown> | null,
) => {
	if (/^\t+/m.test(input)) {
		return '\t';
	}

	const indentation = input.match(/^([ ]+)\S/m)?.[1].length;
	if (indentation) {
		return ' '.repeat(indentation > 1 ? indentation : 2);
	}

	if (prettierConfigOverride?.useTabs === true) {
		return '\t';
	}

	const tabWidth = prettierConfigOverride?.tabWidth;
	return ' '.repeat(
		typeof tabWidth === 'number' && Number.isInteger(tabWidth) && tabWidth > 0
			? tabWidth
			: 2,
	);
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
		.map((line) => `${indent}${line}`)
		.join(insertion.includes('\r\n') ? '\r\n' : '\n');
};

export const printInsertedJsx = ({
	element,
	input,
	prettierConfigOverride,
}: {
	element: namedTypes.JSXElement | namedTypes.JSXFragment;
	input: string;
	prettierConfigOverride: Record<string, unknown> | null;
}): string => {
	const endOfLine = input.includes('\r\n') ? '\r\n' : '\n';
	const unit = getIndentationUnit(input, prettierConfigOverride);
	const printWidth = prettierConfigOverride?.printWidth;
	const configuredTabWidth = prettierConfigOverride?.tabWidth;
	const tabWidth =
		typeof configuredTabWidth === 'number' &&
		Number.isInteger(configuredTabWidth) &&
		configuredTabWidth > 0
			? configuredTabWidth
			: 2;
	recast.types.visit(element, {
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
	const printNode = (node: namedTypes.Node, wrapColumn: number) => {
		// The generic printer drops comments inside empty JSX expressions.
		if (
			node.type === 'JSXExpressionContainer' &&
			(node as namedTypes.JSXExpressionContainer).expression.type ===
				'JSXEmptyExpression'
		) {
			return recast.print(node).code;
		}

		return recast.prettyPrint(node, {
			objectCurlySpacing: prettierConfigOverride?.bracketSpacing !== false,
			quote: prettierConfigOverride?.singleQuote === true ? 'single' : 'double',
			tabWidth,
			useTabs: false,
			wrapColumn,
		}).code;
	};

	const normalizeIndentation = (code: string) => {
		return code
			.split(/\r?\n/)
			.map((line) => {
				const spaces = line.match(/^ */)?.[0].length ?? 0;
				const indentationLevels = Math.floor(spaces / tabWidth);
				const remainingSpaces = spaces % tabWidth;
				return `${unit.repeat(indentationLevels)}${' '.repeat(remainingSpaces)}${line.slice(spaces)}`;
			})
			.join(endOfLine);
	};

	const printOpeningElement = (opening: namedTypes.JSXOpeningElement) => {
		const effectivePrintWidth =
			typeof printWidth === 'number' ? printWidth : 80;
		const name = printNode(opening.name, effectivePrintWidth);
		const attributes = (opening.attributes ?? []).map((attribute) => {
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
			return !unwrapped.includes(endOfLine) &&
				unwrapped.length <= effectivePrintWidth
				? unwrapped
				: normalizeIndentation(printNode(attribute, effectivePrintWidth));
		});
		const suffix = opening.selfClosing ? ' />' : '>';
		const singleLine = `<${name}${attributes.length === 0 ? '' : ` ${attributes.join(' ')}`}${suffix}`;
		if (
			!attributes.some((attribute) => attribute.includes(endOfLine)) &&
			singleLine.length <= effectivePrintWidth
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

				return [
					normalizeIndentation(
						printNode(child, typeof printWidth === 'number' ? printWidth : 80),
					),
				];
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
			? normalizeIndentation(
					printNode(
						node.closingElement,
						typeof printWidth === 'number' ? printWidth : 80,
					),
				)
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
				printNode(
					children[0],
					typeof printWidth === 'number' ? printWidth : 80,
				),
			)}${closing}`;
		}

		const printedChildren = children.flatMap((child) => {
			if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
				return [printElement(child)];
			}

			if (child.type === 'JSXText' && child.value.trim() === '') {
				return [];
			}

			return [
				normalizeIndentation(
					printNode(child, typeof printWidth === 'number' ? printWidth : 80),
				),
			];
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
	prettierConfigOverride,
}: {
	openingElement: namedTypes.JSXOpeningElement;
	input: string;
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
		prettierConfigOverride: {
			bracketSpacing: getObjectCurlySpacing(input, prettierConfigOverride),
			singleQuote:
				getPreferredQuote(input, prettierConfigOverride) === 'single',
			...prettierConfigOverride,
		},
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
