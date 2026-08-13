import {mkdirSync, rmSync} from 'fs';
import path from 'path';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia, renderStill} from '@remotion/renderer';
import {elementDefinitions} from './src/components/Elements/element-definitions';
import {getElementCompositionId} from './src/components/Elements/element-utils';

if (process.argv.includes('--upload')) {
	throw new Error(
		'Preview rendering no longer uploads. Use upload-element-preview after review.',
	);
}

const outputDirectoryArgument = process.argv.find((argument) =>
	argument.startsWith('--output-dir='),
);
const outputDirectory = outputDirectoryArgument
	? path.resolve(outputDirectoryArgument.slice('--output-dir='.length))
	: path.join(process.cwd(), '.element-previews');
const elementArguments = process.argv.filter((argument) =>
	argument.startsWith('--element='),
);
if (process.argv.includes('--element')) {
	throw new Error('Use --element=<category>/<slug>');
}

if (elementArguments.length > 1) {
	throw new Error('Only one --element argument may be specified');
}

const selectedElementSlug = elementArguments[0]
	? elementArguments[0].slice('--element='.length)
	: null;
const allElementDefinitions = Object.values(elementDefinitions);
const selectedElementDefinition = selectedElementSlug
	? allElementDefinitions.find(
			(definition) => definition.slug === selectedElementSlug,
		)
	: null;
if (selectedElementSlug !== null && !selectedElementDefinition) {
	throw new Error(`Unknown Element: ${selectedElementSlug}`);
}

const definitionsToRender = selectedElementDefinition
	? [selectedElementDefinition]
	: allElementDefinitions;

if (selectedElementSlug === null) {
	rmSync(outputDirectory, {force: true, recursive: true});
} else {
	rmSync(path.join(outputDirectory, ...selectedElementSlug.split('/')), {
		force: true,
		recursive: true,
	});
}

mkdirSync(outputDirectory, {recursive: true});

const serveUrl = await bundle({
	entryPoint: path.join(process.cwd(), 'src', 'remotion', 'entry.ts'),
	publicDir: path.join(process.cwd(), 'static'),
});
const compositions = await getCompositions({
	serveUrl,
	inputProps: {},
});
const elementCompositions = compositions.filter((composition) =>
	composition.id.startsWith('element-'),
);

const expectedCompositionIds = new Set(
	Object.values(elementDefinitions).map((definition) =>
		getElementCompositionId(definition.slug),
	),
);
const actualCompositionIds = new Set(
	elementCompositions.map((composition) => composition.id),
);

for (const expectedId of expectedCompositionIds) {
	if (!actualCompositionIds.has(expectedId)) {
		throw new Error(`Missing Element composition: ${expectedId}`);
	}
}

for (const actualId of actualCompositionIds) {
	if (!expectedCompositionIds.has(actualId)) {
		throw new Error(`Unexpected Element composition: ${actualId}`);
	}
}

for (const definition of definitionsToRender) {
	const compositionId = getElementCompositionId(definition.slug);
	const composition = elementCompositions.find(
		(candidate) => candidate.id === compositionId,
	);
	if (!composition) {
		throw new Error(`Could not find composition ${compositionId}`);
	}

	const elementOutputDirectory = path.join(
		outputDirectory,
		...definition.slug.split('/'),
	);
	mkdirSync(elementOutputDirectory, {recursive: true});
	const pngPath = path.join(elementOutputDirectory, 'preview.png');
	const videoPath = path.join(elementOutputDirectory, 'preview.mp4');

	console.log(`Rendering ${definition.displayName} poster`);
	await renderStill({
		chromiumOptions: {gl: 'angle'},
		composition,
		frame: definition.posterFrame,
		output: pngPath,
		serveUrl,
	});

	console.log(`Rendering ${definition.displayName} video`);
	await renderMedia({
		chromiumOptions: {gl: 'angle'},
		codec: 'h264',
		licenseKey: null,
		composition,
		crf: 23,
		imageFormat: 'png',
		muted: true,
		outputLocation: videoPath,
		pixelFormat: 'yuv420p',
		serveUrl,
	});

	console.log(`Rendered ${pngPath}`);
	console.log(`Rendered ${videoPath}`);
}

const renderedScope = selectedElementSlug
	? `Element ${selectedElementSlug}`
	: 'all Element previews';
console.log(`Rendered ${renderedScope} to ${outputDirectory}.`);
