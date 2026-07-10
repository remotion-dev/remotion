import {getRemotionElementSource} from './element-source-utils.js';

const getAttributeValue = (node, name) => {
	const attribute = node.attributes?.find((attr) => attr.name === name);

	if (!attribute || typeof attribute.value !== 'string') {
		return null;
	}

	return attribute.value;
};

const sourceCodeAttribute = (sourceCode) => {
	const value = JSON.stringify(sourceCode);

	return {
		type: 'mdxJsxAttribute',
		name: 'sourceCode',
		value: {
			type: 'mdxJsxAttributeValueExpression',
			value,
			data: {
				estree: {
					type: 'Program',
					body: [
						{
							type: 'ExpressionStatement',
							expression: {
								type: 'Literal',
								value: sourceCode,
								raw: value,
							},
						},
					],
					sourceType: 'module',
				},
			},
		},
	};
};

const setElementPageSourceCode = ({node, sourceCode}) => {
	const attributesWithoutSourceFile = (node.attributes ?? []).filter(
		(attribute) => attribute.name !== 'sourceFile',
	);
	const existingSourceCode = attributesWithoutSourceFile.find(
		(attribute) => attribute.name === 'sourceCode',
	);

	node.attributes = existingSourceCode
		? attributesWithoutSourceFile
		: [...attributesWithoutSourceFile, sourceCodeAttribute(sourceCode)];
};

const getSourceCodeNode = ({node, sourceFilePath}) => {
	if (node.type !== 'mdxJsxFlowElement' || node.name !== 'ElementPage') {
		return null;
	}

	const file = getAttributeValue(node, 'sourceFile');

	if (!file) {
		return null;
	}

	const sourceCode = getRemotionElementSource({file, sourceFilePath});
	setElementPageSourceCode({node, sourceCode});

	return {
		type: 'code',
		lang: file.split('.').at(-1) ?? 'tsx',
		meta: `twoslash title="${file.split('/').at(-1) ?? file}"`,
		value: sourceCode,
	};
};

const attachElementPageSourceNodes = ({node, sourceFilePath}) => {
	if (!node.children) {
		return;
	}

	const children = [];

	for (const child of node.children) {
		attachElementPageSourceNodes({node: child, sourceFilePath});

		const sourceCodeNode = getSourceCodeNode({node: child, sourceFilePath});
		if (sourceCodeNode) {
			child.children = [...(child.children ?? []), sourceCodeNode];
		}

		children.push(child);
	}

	node.children = children;
};

export default function remarkElementSource() {
	return (tree, file) => {
		attachElementPageSourceNodes({
			node: tree,
			sourceFilePath: file.path,
		});
	};
}
