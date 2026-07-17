import path from 'path';
import {fileURLToPath} from 'url';
import {
	getRemotionElementDependencies,
	getRemotionElementSource,
} from './element-source-utils.js';

const ELEMENT_SOURCE_LOADER = path
	.resolve(
		path.dirname(fileURLToPath(import.meta.url)),
		'element-source-file-loader.cjs',
	)
	.replaceAll('\\', '/');

const toPosixPath = (filePath) => filePath.replaceAll('\\', '/');

const getWebpackElementSourceRequest = ({file, sourceFilePath}) => {
	const absoluteSourcePath = path.resolve(path.dirname(sourceFilePath), file);
	const relativeSourcePath = toPosixPath(
		path.relative(path.dirname(sourceFilePath), absoluteSourcePath),
	);
	const webpackResource = relativeSourcePath.startsWith('.')
		? relativeSourcePath
		: `./${relativeSourcePath}`;

	// !! disables other loaders so .tsx is read as text, not compiled as JS.
	return `!!${ELEMENT_SOURCE_LOADER}!${webpackResource}`;
};

const getAttributeValue = (node, name) => {
	const attribute = node.attributes?.find((attr) => attr.name === name);

	if (!attribute || typeof attribute.value !== 'string') {
		return null;
	}

	return attribute.value;
};

const sourceCodeAttribute = (webpackRequest) => {
	const value = `require(${JSON.stringify(webpackRequest)})`;

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
								type: 'CallExpression',
								callee: {
									type: 'Identifier',
									name: 'require',
								},
								arguments: [
									{
										type: 'Literal',
										value: webpackRequest,
										raw: JSON.stringify(webpackRequest),
									},
								],
								optional: false,
							},
						},
					],
					sourceType: 'module',
				},
			},
		},
	};
};

const dependenciesAttribute = (dependencies) => {
	const value = JSON.stringify(dependencies);

	return {
		type: 'mdxJsxAttribute',
		name: 'dependencies',
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
								type: 'ArrayExpression',
								elements: dependencies.map((dependency) => ({
									type: 'Literal',
									value: dependency,
									raw: JSON.stringify(dependency),
								})),
							},
						},
					],
					sourceType: 'module',
				},
			},
		},
	};
};

const setElementPageSource = ({dependencies, node, webpackRequest}) => {
	const attributesWithoutSourceFile = (node.attributes ?? []).filter(
		(attribute) => attribute.name !== 'sourceFile',
	);
	const attributesWithoutGeneratedValues = attributesWithoutSourceFile.filter(
		(attribute) =>
			attribute.name !== 'sourceCode' && attribute.name !== 'dependencies',
	);

	node.attributes = [
		...attributesWithoutGeneratedValues,
		sourceCodeAttribute(webpackRequest),
		dependenciesAttribute(dependencies),
	];
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
	const dependencies = getRemotionElementDependencies(sourceCode);
	const webpackRequest = getWebpackElementSourceRequest({file, sourceFilePath});
	setElementPageSource({dependencies, node, webpackRequest});

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
};
