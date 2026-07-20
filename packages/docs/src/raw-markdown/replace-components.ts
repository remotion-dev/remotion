import path from 'path';
import {VERSION} from 'remotion';
import {studioTableOfContents} from '../../docs/studio/table-of-contents-data';

export type RawMarkdownComponentReplacement = {
	readonly componentName: string;
	readonly render: (context: {
		readonly attributes: string;
		readonly sourcePath: string;
	}) => string | null;
	readonly appliesTo?: (sourcePath: string) => boolean;
	readonly removeImport?: RegExp;
	readonly required?: boolean;
};

const escapeRegExp = (value: string) => {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getStringAttribute = ({
	attributes,
	name,
}: {
	attributes: string;
	name: string;
}) => {
	const escapedName = escapeRegExp(name);
	const match = attributes.match(
		new RegExp(`(?:^|\\s)${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`),
	);

	return match?.[1] ?? match?.[2] ?? null;
};

export const replaceRawMarkdownComponents = ({
	raw,
	sourcePath,
	replacements,
}: {
	raw: string;
	sourcePath: string;
	replacements: readonly RawMarkdownComponentReplacement[];
}) => {
	return replacements.reduce((currentRaw, replacement) => {
		if (replacement.appliesTo && !replacement.appliesTo(sourcePath)) {
			return currentRaw;
		}

		const componentPattern = new RegExp(
			`<${escapeRegExp(replacement.componentName)}\\b([^<>]*?)\\s*/>`,
			'g',
		);
		let replacementCount = 0;
		const withMarkdown = currentRaw.replace(
			componentPattern,
			(fullMatch, attributes: string) => {
				const markdown = replacement.render({attributes, sourcePath});
				if (markdown === null) {
					return fullMatch;
				}

				replacementCount++;
				return markdown;
			},
		);

		if (replacement.required && replacementCount === 0) {
			throw new Error(
				`Could not expand <${replacement.componentName}> in ${sourcePath}`,
			);
		}

		if (!replacement.removeImport || replacementCount === 0) {
			return withMarkdown;
		}

		const withoutImport = withMarkdown.replace(replacement.removeImport, '');
		if (replacement.required && withoutImport === withMarkdown) {
			throw new Error(
				`Could not remove the <${replacement.componentName}> import in ${sourcePath}`,
			);
		}

		return withoutImport;
	}, raw);
};

const markdownTable = (
	items: readonly {
		link: string;
		label: string;
		description: string;
	}[],
) => {
	return [
		'| API | Description |',
		'| --- | --- |',
		...items.map(
			(item) => `| [\`${item.label}\`](${item.link}) | ${item.description} |`,
		),
	].join('\n');
};

const getInstallationMarkdown = (pkg: string) => {
	const pkgList = pkg.split(' ');
	const allRemotionOnly = pkgList.every(
		(packageName) =>
			packageName.startsWith('@remotion/') || packageName === 'remotion',
	);
	const showRemotionCli =
		allRemotionOnly &&
		!pkgList.includes('remotion') &&
		!pkgList.includes('@remotion/cli');

	const command = showRemotionCli
		? `npx remotion add ${pkg}`
		: `npm i --save-exact ${pkgList
				.map((packageName) => {
					if (
						packageName.startsWith('@remotion/') ||
						packageName === 'remotion'
					) {
						return `${packageName}@${VERSION}`;
					}

					return packageName;
				})
				.join(' ')}`;

	return ['```bash', command, '```'].join('\n');
};

const studioApiPath = path.join('docs', 'studio', 'api.mdx');

const rawMarkdownComponentReplacements: readonly RawMarkdownComponentReplacement[] =
	[
		{
			componentName: 'Installation',
			render: ({attributes}) => {
				const pkg = getStringAttribute({attributes, name: 'pkg'});
				if (pkg === null) {
					throw new Error('The <Installation> component is missing a pkg prop');
				}

				return getInstallationMarkdown(pkg);
			},
		},
		{
			componentName: 'TableOfContents',
			appliesTo: (sourcePath) =>
				path.normalize(sourcePath).endsWith(studioApiPath),
			render: () => markdownTable(studioTableOfContents),
			removeImport:
				/^import\s+\{\s*TableOfContents\s*\}\s+from\s+['"]\.\/TableOfContents['"];\s*\n/m,
			required: true,
		},
	];

export const expandRawMarkdownComponents = ({
	raw,
	sourcePath,
}: {
	raw: string;
	sourcePath: string;
}) => {
	return replaceRawMarkdownComponents({
		raw,
		sourcePath,
		replacements: rawMarkdownComponentReplacements,
	});
};
