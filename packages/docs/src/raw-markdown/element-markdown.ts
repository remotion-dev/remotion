import type {ElementDefinition} from '../components/Elements/element-definitions';
import {
	getElementDocumentationUrl,
	getElementLibrarySections,
} from '../components/Elements/element-library-data';

const codeBlock = (language: string, content: string) => {
	const fence = '`'.repeat(
		Math.max(
			3,
			...Array.from(content.matchAll(/`+/g), ([match]) => match.length + 1),
		),
	);
	return `${fence}${language}\n${content}\n${fence}`;
};

export const getElementMarkdownUrl = (definition: ElementDefinition) => {
	return `/elements/${definition.slug}.md`;
};

export const getElementCatalogMarkdown = () => {
	return [
		'# Remotion Elements',
		'Editable video building blocks for Remotion. Each Element document includes its install command and source code.',
		...getElementLibrarySections(null).map((section) =>
			[
				`## ${section.label}`,
				section.definitions
					.map(
						(definition) =>
							`- [${definition.displayName}](${getElementMarkdownUrl(definition)}) - ${definition.description}`,
					)
					.join('\n'),
			].join('\n\n'),
		),
		'## More Elements',
		'Browse the catalog [directly inside Remotion Studio](https://www.remotion.dev/docs/studio/browse-elements.md).',
		'Add [third-party Element Libraries](https://www.remotion.dev/elements/libraries.md) to browse and install Elements from other creators in Studio.',
		'Have an Element idea? [Contribute](https://www.remotion.dev/docs/contributing/elements.md).',
		'',
	].join('\n\n');
};

export const getElementMarkdown = ({
	definition,
	sourceCode,
}: {
	readonly definition: ElementDefinition;
	readonly sourceCode: string;
}) => {
	const pageUrl = `https://www.remotion.dev${getElementDocumentationUrl(definition)}`;

	return [
		`# ${definition.displayName}`,
		definition.description,
		`Element page: [${pageUrl}](${pageUrl})`,
		'## Installation',
		'Install this Element into a composition of your Remotion project:',
		codeBlock(
			'sh',
			`npx remotion elements use ${pageUrl} --composition <composition-id> --yes`,
		),
		'Replace `<composition-id>` with the ID of the composition to add the Element to. The command installs the dependencies, downloads the assets, writes the source file and adds the Element to the composition. See [`npx remotion elements use`](https://www.remotion.dev/docs/cli/elements/use.md).',
		'## Manual installation',
		`To install the Element manually instead, save the source below as \`${definition.slug.split('/').pop()}.element.tsx\` in your Remotion project and import its exported component.`,
		'## Source',
		codeBlock('tsx', sourceCode),
		'',
	].join('\n\n');
};
