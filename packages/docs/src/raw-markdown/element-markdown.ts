import type {ElementDefinition} from '../components/Elements/element-definitions';
import {createElementPayloadFromDefinition} from '../components/Elements/element-drag-data';
import {
	getElementCategoryLabel,
	getElementLibrarySections,
	type ElementCategory,
} from '../components/Elements/element-library-data';

const navigation =
	'[All Elements](/elements/index.md) | [Caption styles](/elements/captions.md)';

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

export const getElementCatalogMarkdown = (category: ElementCategory | null) => {
	return [
		`# ${category === null ? 'Remotion Elements' : `${getElementCategoryLabel(category)} - Remotion Elements`}`,
		'Editable video building blocks for Remotion. Each Element document includes its source code and installation metadata.',
		navigation,
		...getElementLibrarySections(category).map((section) =>
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
	sourceFileName,
	notes,
}: {
	readonly definition: ElementDefinition;
	readonly sourceCode: string;
	readonly sourceFileName: string;
	readonly notes: string | null;
}) => {
	const payload = createElementPayloadFromDefinition({
		definition,
		sourceCode,
		installAssets: true,
	});
	const remotionDependencies = definition.dependencies.filter(
		({version}) => version === null,
	);
	const otherDependencies = definition.dependencies.filter(
		({version}) => version !== null,
	);
	const installationCommands = [
		...(remotionDependencies.length === 0
			? []
			: [
					`npx remotion add ${remotionDependencies.map(({name}) => name).join(' ')}`,
				]),
		...(otherDependencies.length === 0
			? []
			: [
					`npm install --save-exact ${otherDependencies.map(({name, version}) => `${name}@${version}`).join(' ')}`,
				]),
	];

	return [
		`# ${definition.displayName}`,
		definition.description,
		navigation,
		'## Details',
		`- Category: ${getElementCategoryLabel(definition.category)}\n- Duration: ${definition.durationInFrames} frames (${definition.durationInFrames / definition.fps}s at ${definition.fps} fps)\n- Dimensions: ${payload.element.dimensions === null ? 'Fills composition' : `${payload.element.dimensions.width} x ${payload.element.dimensions.height}`}`,
		...(notes === null ? [] : [notes]),
		'## Installation',
		`Save the source below as \`${sourceFileName}\` in your Remotion project and import its exported component.`,
		installationCommands.length === 0
			? 'No additional package dependencies are required beyond React and Remotion.'
			: codeBlock('sh', installationCommands.join('\n')),
		definition.installationMode === 'wrapped'
			? 'Wrap the component in a Remotion Sequence and use the duration and dimensions below.'
			: 'The component owns its Sequence. Pass timing props to the component rather than adding an outer Sequence.',
		'Use the installation metadata below for default props, dependencies, and assets. Asset references in initialProps must be resolved to local staticFile() calls after saving the declared assets to your public directory. See the [Element Library integration guide](https://www.remotion.dev/docs/elements/libraries.md) for asset handling and Studio installation.',
		'## Installation metadata',
		codeBlock(
			'json',
			JSON.stringify(
				{
					slug: definition.slug,
					displayName: definition.displayName,
					fps: definition.fps,
					durationInFrames: payload.durationInFrames,
					dimensions: payload.element.dimensions,
					installationMode: definition.installationMode,
					isCaptionStyle: definition.category === 'captions',
					initialProps: payload.element.initialProps,
					dependencies: payload.element.dependencies,
					assets: payload.element.assets,
				},
				null,
				2,
			),
		),
		'## Source',
		codeBlock('tsx', sourceCode),
		'',
	].join('\n\n');
};
