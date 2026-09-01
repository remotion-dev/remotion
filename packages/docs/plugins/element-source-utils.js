import fs from 'fs';
import path from 'path';
import {parse} from '@babel/parser';

const getPackageName = (importPath) => {
	if (
		importPath === 'react' ||
		importPath.startsWith('react/') ||
		importPath === 'react-dom' ||
		importPath.startsWith('react-dom/') ||
		importPath === 'remotion' ||
		importPath.startsWith('.') ||
		importPath.startsWith('/') ||
		importPath.includes(':')
	) {
		return null;
	}

	if (importPath.startsWith('@')) {
		const [scope, name] = importPath.split('/');
		return scope && name ? `${scope}/${name}` : null;
	}

	return importPath.split('/')[0] || null;
};

const getStringLiteralValue = (node) => {
	return node?.type === 'StringLiteral' ? node.value : null;
};

export const getRemotionElementDependencies = (source) => {
	const ast = parse(source, {
		plugins: ['jsx', 'typescript'],
		sourceType: 'module',
	});
	const importPaths = new Set();

	const visit = (node) => {
		if (!node || typeof node !== 'object') {
			return;
		}

		if (
			node.type === 'ImportDeclaration' ||
			node.type === 'ExportNamedDeclaration' ||
			node.type === 'ExportAllDeclaration'
		) {
			const value = getStringLiteralValue(node.source);
			if (value) {
				importPaths.add(value);
			}
		} else if (node.type === 'ImportExpression') {
			const value = getStringLiteralValue(node.source);
			if (value) {
				importPaths.add(value);
			}
		} else if (
			node.type === 'CallExpression' &&
			node.callee?.type === 'Import'
		) {
			const value = getStringLiteralValue(node.arguments?.[0]);
			if (value) {
				importPaths.add(value);
			}
		}

		for (const value of Object.values(node)) {
			if (Array.isArray(value)) {
				value.forEach(visit);
			} else if (value && typeof value === 'object') {
				visit(value);
			}
		}
	};

	visit(ast);

	return Array.from(
		new Set(Array.from(importPaths, getPackageName).filter(Boolean)),
	);
};

const getFence = (source) => {
	const longestBacktickRun = Math.max(
		0,
		...Array.from(source.matchAll(/`+/g)).map((match) => match[0].length),
	);

	return '`'.repeat(Math.max(3, longestBacktickRun + 1));
};

export const getRemotionElementSource = ({file, sourceFilePath}) => {
	const absoluteSourcePath = path.resolve(path.dirname(sourceFilePath), file);

	try {
		return fs.readFileSync(absoluteSourcePath, 'utf8').trimEnd();
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);

		throw new Error(
			`Could not read Element source file "${absoluteSourcePath}" ` +
				`referenced from "${sourceFilePath}": ${message}`,
		);
	}
};

export const getElementSourceCodeBlock = ({file, sourceFilePath}) => {
	const source = getRemotionElementSource({file, sourceFilePath});
	const extension = path.extname(file).slice(1) || 'tsx';
	const fence = getFence(source);

	return `${fence}${extension} twoslash title="${path.basename(file)}"\n${source}\n${fence}`;
};

const parseAttributes = (attributes) => {
	const parsed = new Map();
	const regex = /(\w+)="([^"]*)"/g;
	let match = regex.exec(attributes);

	while (match) {
		parsed.set(match[1], match[2]);
		match = regex.exec(attributes);
	}

	return parsed;
};

export const getRemotionElementSourceMap = ({elementsRoot}) => {
	const indexFiles = [];
	const walk = (directory) => {
		for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
			const absolutePath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				walk(absolutePath);
			} else if (entry.name === 'index.mdx') {
				indexFiles.push(absolutePath);
			}
		}
	};

	walk(elementsRoot);
	const sourceCodeBySlug = {};

	for (const sourceFilePath of indexFiles.sort()) {
		const raw = fs.readFileSync(sourceFilePath, 'utf8');
		const elementPages = Array.from(
			raw.matchAll(/<ElementPage\b([\s\S]*?)\/>/g),
		);
		if (elementPages.length === 0) {
			continue;
		}

		if (elementPages.length > 1) {
			throw new Error(
				`Expected one ElementPage in "${sourceFilePath}", found ${elementPages.length}.`,
			);
		}

		const file = parseAttributes(elementPages[0][1]).get('sourceFile');
		if (!file) {
			throw new Error(
				`ElementPage in "${sourceFilePath}" must have a sourceFile attribute.`,
			);
		}

		const relativeDirectory = path.relative(
			elementsRoot,
			path.dirname(sourceFilePath),
		);
		const slug = relativeDirectory.split(path.sep).join('/');
		if (!slug || slug.startsWith('../') || path.isAbsolute(relativeDirectory)) {
			throw new Error(
				`Could not derive an Element slug for "${sourceFilePath}" relative to "${elementsRoot}".`,
			);
		}

		if (Object.hasOwn(sourceCodeBySlug, slug)) {
			throw new Error(`Duplicate Element source found for slug "${slug}".`);
		}

		sourceCodeBySlug[slug] = getRemotionElementSource({
			file,
			sourceFilePath,
		});
	}

	return sourceCodeBySlug;
};

const appendSourceCodeBlock = ({attributes, match, sourceFilePath}) => {
	const parsed = parseAttributes(attributes);
	const file = parsed.get('sourceFile');

	if (!file) {
		return match;
	}

	return `${match}\n\n${getElementSourceCodeBlock({
		file,
		sourceFilePath,
	})}`;
};

export const expandElementSourceReferences = ({raw, sourceFilePath}) => {
	return raw.replace(/<ElementPage\b([\s\S]*?)\/>/g, (match, attributes) => {
		return appendSourceCodeBlock({attributes, match, sourceFilePath});
	});
};
