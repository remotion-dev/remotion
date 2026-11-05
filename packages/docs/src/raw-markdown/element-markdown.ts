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
		'Editable video building blocks for Remotion. Each Element document links to its page and includes its source code.',
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
		'## Source',
		codeBlock('tsx', sourceCode),
		'',
	].join('\n\n');
};
