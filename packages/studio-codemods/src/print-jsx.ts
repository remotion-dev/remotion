import type {namedTypes} from 'ast-types';
import * as recast from 'recast';

const identifierRegex = /^[A-Za-z_$][0-9A-Za-z_$]*$/;

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
	const printNode = (node: namedTypes.Node) => {
		return recast.prettyPrint(node, {
			objectCurlySpacing: prettierConfigOverride?.bracketSpacing !== false,
			quote: prettierConfigOverride?.singleQuote === true ? 'single' : 'double',
			tabWidth,
			useTabs: false,
			wrapColumn: typeof printWidth === 'number' ? printWidth : 80,
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
		const name = printNode(opening.name);
		const attributes = (opening.attributes ?? []).map((attribute) => {
			if (
				attribute.type === 'JSXAttribute' &&
				attribute.name.type === 'JSXIdentifier' &&
				attribute.value?.type === 'StringLiteral'
			) {
				return `${attribute.name.name}=${JSON.stringify(attribute.value.value)}`;
			}

			return normalizeIndentation(printNode(attribute));
		});
		const suffix = opening.selfClosing ? ' />' : '>';
		const singleLine = `<${name}${attributes.length === 0 ? '' : ` ${attributes.join(' ')}`}${suffix}`;
		if (
			!attributes.some((attribute) => attribute.includes(endOfLine)) &&
			singleLine.length <= (typeof printWidth === 'number' ? printWidth : 80)
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

				return [normalizeIndentation(printNode(child))];
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
			? normalizeIndentation(printNode(node.closingElement))
			: '';
		const children = node.children ?? [];
		if (
			children.length === 1 &&
			children[0].type === 'JSXText' &&
			!children[0].value.includes('\n')
		) {
			return `${opening}${children[0].value}${closing}`;
		}

		const printedChildren = children.flatMap((child) => {
			if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
				return [printElement(child)];
			}

			if (child.type === 'JSXText' && child.value.trim() === '') {
				return [];
			}

			return [normalizeIndentation(printNode(child))];
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
