import fs from 'node:fs';
import path from 'node:path';
import sidebars from './sidebars';

const tocsRenderedFromData = ['effects', 'shapes'];

const docsDir = path.join(__dirname, 'docs');

const walk = (dir: string): string[] =>
	fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		return entry.isDirectory() ? walk(full) : [full];
	});

const files = walk(docsDir);

const docUrls = new Map<string, string>();
const apiPages = new Set<string>();
for (const file of files.filter((f) => /\.mdx?$/.test(f))) {
	const rel = path.relative(docsDir, file).replace(/\.mdx?$/, '');
	const dir = path.dirname(rel) === '.' ? '' : path.dirname(rel) + '/';
	const content = fs.readFileSync(file, 'utf8');
	const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
	const field = (name: string) =>
		frontmatter
			.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1]
			.trim()
			.replace(/^['"]|['"]$/g, '');
	const id = dir + (field('id') ?? path.basename(rel));
	const slug = field('slug');
	const url = slug
		? slug.startsWith('/')
			? '/docs' + slug
			: '/docs/' + dir + slug
		: '/docs/' + id;
	docUrls.set(id, url.replace(/\/index$/, '').replace(/\/$/, ''));

	const title = field('title') ?? '';
	const isDeprecated = /:::info Deprecated|Removed in v\d/.test(content);
	if (
		(title.startsWith('npx remotion ') || !/\s/.test(title)) &&
		!isDeprecated
	) {
		apiPages.add(id);
	}
}

type SidebarItem =
	| string
	| {
			type: string;
			id?: string;
			link?: {type: string; id?: string};
			items?: SidebarItem[];
	  };

const categories = new Map<string, SidebarItem[]>();
const collect = (items: SidebarItem[]) => {
	for (const item of items) {
		if (typeof item === 'string' || item.type !== 'category') {
			continue;
		}

		if (item.link?.type === 'doc' && item.link.id) {
			categories.set(item.link.id, item.items ?? []);
		}

		collect(item.items ?? []);
	}
};

for (const sidebar of Object.values(sidebars)) {
	collect(sidebar as SidebarItem[]);
}

const children = (items: SidebarItem[]): {id: string; isCategory: boolean}[] =>
	items.flatMap((item) => {
		if (typeof item === 'string') {
			return [{id: item, isCategory: false}];
		}

		if (item.type === 'doc' && item.id) {
			return [{id: item.id, isCategory: false}];
		}

		if (item.type === 'category' && item.link?.type === 'doc' && item.link.id) {
			return [{id: item.link.id, isCategory: true}];
		}

		return [];
	});

const problems: string[] = [];

for (const toc of files.filter((f) => f.endsWith('table-of-contents.tsx'))) {
	const tocDir = path.relative(docsDir, path.dirname(toc));
	if (tocsRenderedFromData.includes(tocDir)) {
		continue;
	}

	const pages = files.filter((file) => {
		if (!/\.mdx?$/.test(file)) {
			return false;
		}

		const imports = fs
			.readFileSync(file, 'utf8')
			.matchAll(/from ['"]([^'"]*table-of-contents)['"]/g);
		return [...imports].some(
			(m) => path.join(path.dirname(file), m[1]) === toc.replace(/\.tsx$/, ''),
		);
	});

	const pageIds = pages.map((page) =>
		[...docUrls.keys()].find(
			(id) =>
				path.join(docsDir, id) === page.replace(/\.mdx?$/, '') ||
				docUrls.get(id) ===
					'/docs/' + path.relative(docsDir, page).replace(/\.mdx?$/, ''),
		),
	);
	const categoryId = pageIds.find((id) => id && categories.has(id));
	if (!categoryId) {
		continue;
	}

	const tocSource = fs.readFileSync(toc, 'utf8');
	const sources = [
		tocSource,
		...[...tocSource.matchAll(/from ['"](\.[^'"]+)['"]/g)].flatMap((m) => {
			const imported = path.join(path.dirname(toc), m[1]) + '.tsx';
			return fs.existsSync(imported) ? [fs.readFileSync(imported, 'utf8')] : [];
		}),
	];
	const links = sources.flatMap((source) =>
		[...source.matchAll(/link=["']([^"']+)["']/g)].map((m) =>
			m[1].replace(/\/$/, ''),
		),
	);

	for (const {id, isCategory} of children(categories.get(categoryId) ?? [])) {
		const url = docUrls.get(id) ?? '/docs/' + id;
		const listed = isCategory
			? links.some((link) => link === url || link.startsWith(url + '/'))
			: links.includes(url) || !apiPages.has(id);
		if (!listed) {
			problems.push(
				`${path.relative(__dirname, toc)} does not link to ${url} (sidebar item "${id}")`,
			);
		}
	}
}

if (problems.length > 0) {
	console.error(problems.join('\n'));
	console.error('\nAdd a <TOCItem> for each of these pages.');
	process.exit(1);
}

console.log(
	'All tables of contents link to every API page of their sidebar category.',
);
