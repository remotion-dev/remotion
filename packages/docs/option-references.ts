import {readdirSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import type {AnyRemotionOption} from '@remotion/renderer';

export type OptionReference = {
	title: string;
	url: string;
	name: string;
	cli: boolean;
	deprecated: boolean;
};

type MarkdownNode =
	| {
			type: 'heading';
			depth: number;
			children: MarkdownNode[];
			position: {start: {offset: number}; end: {offset: number}};
	  }
	| {type: 'text' | 'inlineCode'; value: string}
	| {
			type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
			name: string;
			attributes: {name: string; value: unknown}[];
			children: MarkdownNode[];
	  }
	| {type: 'mdxFlowExpression' | 'mdxTextExpression'; value: string}
	| {
			type:
				| 'root'
				| 'paragraph'
				| 'emphasis'
				| 'strong'
				| 'delete'
				| 'link'
				| 'list'
				| 'listItem'
				| 'blockquote';
			children: MarkdownNode[];
	  }
	| {type: 'code' | 'html' | 'thematicBreak' | 'break' | 'mdxjsEsm'};

export const collectOptionReferences = (
	options: readonly AnyRemotionOption<unknown>[],
): Map<string, OptionReference[]> => {
	// Resolve the same parsers and slugger used by the installed Docusaurus.
	const requireDocs = createRequire(import.meta.url);
	const requirePlugin = createRequire(
		requireDocs.resolve('@docusaurus/plugin-content-docs/package.json'),
	);
	const {createSlugger, parseMarkdownHeadingId} =
		requirePlugin('@docusaurus/utils');
	const {parseFileContentFrontMatter} = requirePlugin(
		'@docusaurus/utils/lib/markdownUtils',
	);
	const requireMdx = createRequire(
		requirePlugin.resolve('@docusaurus/mdx-loader/package.json'),
	);
	const {createProcessor} = requireMdx('@mdx-js/mdx');
	const parser = createProcessor({format: 'mdx'});
	const docsRoot = path.join(import.meta.dirname, 'docs');
	const references = new Map<string, OptionReference[]>();
	const files: string[] = [];
	const walkFiles = (directory: string) => {
		for (const entry of readdirSync(directory, {withFileTypes: true})) {
			if (entry.isDirectory()) {
				if (entry.name !== 'options') {
					walkFiles(path.join(directory, entry.name));
				}
			} else if (entry.name.endsWith('.mdx')) {
				files.push(path.join(directory, entry.name));
			}
		}
	};

	walkFiles(docsRoot);

	for (const file of files.sort()) {
		const relativePath = path
			.relative(docsRoot, file)
			.replaceAll(path.sep, '/');
		const {frontMatter, content} = parseFileContentFrontMatter(
			readFileSync(file, 'utf8'),
		);
		const title: string | null = frontMatter.title ?? null;
		if (title === null || frontMatter.draft === true) {
			continue;
		}

		const cli = /^(?:cli|lambda\/cli|cloudrun\/cli)\//.test(relativePath);
		const config = relativePath === 'config.mdx';
		const api =
			(/^(?:renderer|lambda|cloudrun|bundler|studio|web-renderer)\//.test(
				relativePath,
			) ||
				relativePath === 'bundle.mdx') &&
			/\w+\(\)$/.test(title);
		if (!cli && !config && !api) {
			continue;
		}

		const directory = path.posix.dirname(relativePath);
		const baseId = frontMatter.id ?? path.posix.basename(relativePath, '.mdx');
		const slug = frontMatter.slug ?? baseId;
		const route = slug.startsWith('/')
			? slug
			: path.posix.join(directory, slug === 'index' ? '' : slug);
		const docUrl = `/docs/${route.replace(/^\//, '').replace(/\/$/, '')}`;
		const tree = parser.parse(content) as {children: MarkdownNode[]};
		const slugger = createSlugger();
		const text = (node: MarkdownNode): string => {
			if ('value' in node && node.type !== 'mdxTextExpression') {
				return node.value;
			}

			return 'children' in node ? node.children.map(text).join('') : '';
		};

		let inputSection = config;
		let heading: {
			name: string;
			url: string;
			deprecated: boolean;
		} | null = null;
		const parents: {depth: number; name: string}[] = [];
		const headingCode = (node: MarkdownNode): string | null => {
			if (node.type === 'inlineCode') {
				return node.value;
			}

			if ('children' in node) {
				for (const child of node.children) {
					const value = headingCode(child);
					if (value !== null) {
						return value;
					}
				}
			}

			return null;
		};

		const addReference = (
			id: string,
			currentHeading: NonNullable<typeof heading>,
		) => {
			const entries = references.get(id) ?? [];
			const {name} = currentHeading;
			if (
				!entries.some(
					(entry) => entry.url === currentHeading.url && entry.name === name,
				)
			) {
				entries.push({
					title,
					url: currentHeading.url,
					name,
					cli,
					deprecated: currentHeading.deprecated,
				});
				references.set(id, entries);
			}
		};

		const visit = (node: MarkdownNode) => {
			if (node.type === 'heading') {
				const source = content.slice(
					node.position.start.offset,
					node.position.end.offset,
				);
				const headingText = text(node).replace(/^~~|~~$/g, '');
				const explicitId = parseMarkdownHeadingId(source, 'mdx-comment').id;
				const anchor =
					explicitId ??
					parseMarkdownHeadingId(headingText).id ??
					slugger.slug(headingText);
				if (node.depth === 2 && !config) {
					inputSection =
						/^(?:Arguments?|API|Options?|Parameters?|Flags|Global options)$/i.test(
							headingText.trim(),
						);
				}

				while (
					parents.length > 0 &&
					parents[parents.length - 1].depth >= node.depth
				) {
					parents.pop();
				}

				const name = headingCode(node)?.replace(/\?$/, '') ?? null;
				heading =
					name === null || !inputSection
						? null
						: {
								name: config
									? `Config.${name}`
									: [...parents.map((parent) => parent.name), name].join('.'),
								url: `${docUrl}#${anchor}`,
								deprecated: source.includes('~~'),
							};
				// Some pages use inconsistent heading depths for sibling fields.
				// Only documented object containers contribute to a property path.
				if (
					name !== null &&
					!cli &&
					!config &&
					/^(?:options|chromiumOptions|webhook)$/.test(name)
				) {
					parents.push({depth: node.depth, name});
				}

				if (heading === null) {
					return;
				}

				// A shared flag/property can represent distinct still and video formats.
				const matches = options.filter((option) => {
					if (
						option.id === 'still-image-format' ||
						option.id === 'video-image-format'
					) {
						if (config) {
							return (
								name ===
								(option.id === 'still-image-format'
									? 'setStillImageFormat()'
									: 'setVideoImageFormat()')
							);
						}

						return (
							name === (cli ? '--image-format' : 'imageFormat') &&
							option.id ===
								(/still/i.test(title)
									? 'still-image-format'
									: 'video-image-format')
						);
					}

					return cli
						? name === `--${option.cliFlag}`
						: config
							? option.ssrName !== null &&
								name ===
									`set${option.ssrName[0].toUpperCase()}${option.ssrName.slice(1)}()`
							: name === option.ssrName;
				});
				for (const option of matches) {
					addReference(option.id, heading);
				}

				return;
			}

			if (
				(node.type === 'mdxJsxFlowElement' ||
					node.type === 'mdxJsxTextElement') &&
				node.name === 'Options' &&
				heading !== null
			) {
				const id = node.attributes.find(
					(attribute) => attribute.name === 'id',
				)?.value;
				if (
					typeof id === 'string' &&
					options.some((option) => option.id === id)
				) {
					addReference(id, heading);
				}
			}

			if ('children' in node) {
				for (const child of node.children) {
					visit(child);
				}
			}
		};

		for (const node of tree.children) {
			visit(node);
		}
	}

	return references;
};
