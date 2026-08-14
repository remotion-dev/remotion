import path from 'path';
import {
	getRemotionElementSource,
	getRemotionElementSourceMap,
} from './element-source-utils.js';

const getAttribute = (node, name) => {
	return node.attributes?.find((attribute) => attribute.name === name) ?? null;
};

const getStringAttributeValue = (node, name) => {
	const attribute = getAttribute(node, name);

	if (!attribute || typeof attribute.value !== 'string') {
		return null;
	}

	return attribute.value;
};

const literal = (value) => {
	return {
		type: 'Literal',
		value,
		raw: JSON.stringify(value),
	};
};

const expressionAttribute = ({expression, name, value}) => {
	return {
		type: 'mdxJsxAttribute',
		name,
		value: {
			type: 'mdxJsxAttributeValueExpression',
			value,
			data: {
				estree: {
					type: 'Program',
					body: [
						{
							type: 'ExpressionStatement',
							expression,
						},
					],
					sourceType: 'module',
				},
			},
		},
	};
};

const sourceCodeAttribute = (sourceCode) => {
	return expressionAttribute({
		expression: literal(sourceCode),
		name: 'sourceCode',
		value: JSON.stringify(sourceCode),
	});
};

const sourceCodeBySlugAttribute = (sourceCodeBySlug) => {
	return expressionAttribute({
		expression: {
			type: 'ObjectExpression',
			properties: Object.entries(sourceCodeBySlug).map(
				([slug, sourceCode]) => ({
					type: 'Property',
					method: false,
					shorthand: false,
					computed: false,
					key: literal(slug),
					value: literal(sourceCode),
					kind: 'init',
				}),
			),
		},
		name: 'sourceCodeBySlug',
		value: JSON.stringify(sourceCodeBySlug),
	});
};

const setGeneratedAttribute = ({attribute, name, node}) => {
	node.attributes = [
		...(node.attributes ?? []).filter(
			(existingAttribute) => existingAttribute.name !== name,
		),
		attribute,
	];
};

const getSourceCodeNode = ({node, sourceFilePath}) => {
	if (node.type !== 'mdxJsxFlowElement' || node.name !== 'ElementPage') {
		return null;
	}

	const file = getStringAttributeValue(node, 'sourceFile');
	if (!file) {
		return null;
	}

	const sourceCode = getRemotionElementSource({file, sourceFilePath});
	node.attributes = (node.attributes ?? []).filter(
		(attribute) => attribute.name !== 'sourceFile',
	);
	setGeneratedAttribute({
		attribute: sourceCodeAttribute(sourceCode),
		name: 'sourceCode',
		node,
	});

	return {
		type: 'code',
		lang: file.split('.').at(-1) ?? 'tsx',
		meta: `twoslash title="${file.split('/').at(-1) ?? file}"`,
		value: sourceCode,
	};
};

const getElementLibraryCategory = (node) => {
	const attribute = getAttribute(node, 'category');
	if (!attribute) {
		throw new Error('ElementLibrary must have a category attribute.');
	}

	if (typeof attribute.value === 'string') {
		return attribute.value;
	}

	if (
		attribute.value?.type === 'mdxJsxAttributeValueExpression' &&
		attribute.value.value.trim() === 'null'
	) {
		return null;
	}

	throw new Error('ElementLibrary category must be a string or null.');
};

const findElementsRoot = (sourceFilePath) => {
	let directory = path.dirname(sourceFilePath);

	while (true) {
		if (path.basename(directory) === 'elements') {
			return directory;
		}

		const parent = path.dirname(directory);
		if (parent === directory) {
			throw new Error(
				`Could not find the Elements root for "${sourceFilePath}".`,
			);
		}

		directory = parent;
	}
};

const attachElementSourceNodes = ({
	elementRegistry,
	getSourceCodeBySlug,
	node,
	sourceFilePath,
}) => {
	if (!node.children) {
		return;
	}

	for (const child of node.children) {
		attachElementSourceNodes({
			elementRegistry,
			getSourceCodeBySlug,
			node: child,
			sourceFilePath,
		});

		const sourceCodeNode = getSourceCodeNode({node: child, sourceFilePath});
		if (sourceCodeNode) {
			child.children = [...(child.children ?? []), sourceCodeNode];
		}

		if (child.type !== 'mdxJsxFlowElement' || child.name !== 'ElementLibrary') {
			continue;
		}

		const category = getElementLibraryCategory(child);
		const registryEntries = Object.entries(elementRegistry);
		if (
			category !== null &&
			!registryEntries.some(([, metadata]) => metadata.category === category)
		) {
			throw new Error(`Invalid Element category: ${category}`);
		}

		const completeSourceCodeBySlug = getSourceCodeBySlug();
		const registrySlugs = registryEntries.map(([slug]) => slug).sort();
		const sourceSlugs = Object.keys(completeSourceCodeBySlug).sort();
		const missingSources = registrySlugs.filter(
			(slug) => !Object.hasOwn(completeSourceCodeBySlug, slug),
		);
		const unregisteredSources = sourceSlugs.filter(
			(slug) => !Object.hasOwn(elementRegistry, slug),
		);
		if (missingSources.length > 0 || unregisteredSources.length > 0) {
			throw new Error(
				[
					'Element registry and source pages do not match.',
					missingSources.length > 0
						? `Missing source pages: ${missingSources.join(', ')}.`
						: null,
					unregisteredSources.length > 0
						? `Unregistered source pages: ${unregisteredSources.join(', ')}.`
						: null,
				]
					.filter(Boolean)
					.join(' '),
			);
		}

		const selectedSourceCodeBySlug = Object.fromEntries(
			registryEntries
				.filter(
					([, metadata]) => category === null || metadata.category === category,
				)
				.map(([slug]) => [slug, completeSourceCodeBySlug[slug]])
				.sort(([a], [b]) => a.localeCompare(b)),
		);
		setGeneratedAttribute({
			attribute: sourceCodeBySlugAttribute(selectedSourceCodeBySlug),
			name: 'sourceCodeBySlug',
			node: child,
		});
	}
};

export default function remarkElementSource({elementRegistry}) {
	if (!elementRegistry || typeof elementRegistry !== 'object') {
		throw new Error('remarkElementSource requires an Element registry.');
	}

	return (tree, file) => {
		let sourceCodeBySlug = null;
		attachElementSourceNodes({
			elementRegistry,
			getSourceCodeBySlug: () => {
				if (sourceCodeBySlug === null) {
					sourceCodeBySlug = getRemotionElementSourceMap({
						elementsRoot: findElementsRoot(file.path),
					});
				}

				return sourceCodeBySlug;
			},
			node: tree,
			sourceFilePath: file.path,
		});
	};
}
