import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {
	isUrl,
	type InsertableCompositionElement,
	type InsertableCompositionElementPosition,
} from '@remotion/studio-shared';
import {
	createElement,
	staticFileValue,
	type CodemodElement,
} from './codemod-element';
import type {CodemodValue} from './codemod-value';
import {formatTranslateValue} from './insert-jsx-element';

export type InsertableSequenceWrapper = {
	dimensions: {width: number; height: number} | null;
	durationInFrames: number | null;
	from: number | null;
	name: string | null;
	position: InsertableCompositionElementPosition | null;
};

const assetComponents = {
	image: {component: 'CanvasImage', importPath: 'remotion'},
	video: {component: 'Video', importPath: '@remotion/media'},
	audio: {component: 'Audio', importPath: '@remotion/media'},
	gif: {component: 'Gif', importPath: '@remotion/gif'},
	'animated-image': {component: 'AnimatedImage', importPath: 'remotion'},
} as const;

const getPositionStyle = (
	position: InsertableCompositionElementPosition | null,
): Record<string, CodemodValue> => ({
	position: 'absolute',
	...(position === null ? {} : {translate: formatTranslateValue(position)}),
});

// Studio Elements reference their assets with `staticFileRef()` markers.
const toCodemodValue = (value: unknown): CodemodValue => {
	if (StudioProtocolInternals.isStaticFileRef(value)) {
		return staticFileValue(value.__remotion_element_asset);
	}

	if (Array.isArray(value)) {
		return value.map(toCodemodValue);
	}

	if (typeof value === 'object' && value !== null) {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, toCodemodValue(item)]),
		);
	}

	return value as CodemodValue;
};

/**
 * Translates a Studio insertion request for a solid, asset or component into
 * an element for `addElement()`. SVG markup and compositions keep using the
 * dedicated insertion pipeline.
 */
export const createElementFromInsertable = ({
	element,
	from,
	wrapInSequence,
}: {
	element: InsertableCompositionElement;
	from: number | null;
	wrapInSequence: InsertableSequenceWrapper | null;
}): CodemodElement => {
	if (element.type === 'svg' || element.type === 'composition') {
		throw new Error(`Cannot describe a ${element.type} as an element`);
	}

	if (from !== null && (!Number.isInteger(from) || from < 0)) {
		throw new Error('from must be a non-negative integer');
	}

	if (
		element.position !== null &&
		(!Number.isFinite(element.position.x) ||
			!Number.isFinite(element.position.y))
	) {
		throw new Error('Position must be finite');
	}

	// A timed solid gets its own Sequence; other elements carry `from` themselves
	// unless the caller asks for a wrapper.
	const sequence =
		element.type === 'solid' && from !== null
			? {
					dimensions: null,
					durationInFrames: null,
					from,
					name: null,
					position: element.position,
				}
			: wrapInSequence;
	const positioned = sequence === null;

	let inner: CodemodElement;
	if (element.type === 'solid') {
		inner = createElement({
			component: 'Solid',
			importPath: 'remotion',
			props: {
				width: element.width,
				height: element.height,
				color: 'gray',
				style: getPositionStyle(element.position),
			},
		});
	} else if (element.type === 'asset') {
		if (element.srcType === 'remote' && !isUrl(element.src)) {
			throw new Error('Remote asset source must be a URL');
		}

		const dimensions =
			element.assetType === 'image' && from !== null
				? null
				: element.dimensions;
		inner = createElement({
			...assetComponents[element.assetType],
			props: {
				src:
					element.srcType === 'remote'
						? element.src
						: staticFileValue(element.src),
				...(element.assetType !== 'image' && element.durationInFrames !== null
					? {durationInFrames: element.durationInFrames}
					: {}),
				...(from === null ? {} : {from}),
				...(positioned && element.assetType !== 'audio'
					? {
							style: {
								...getPositionStyle(element.position),
								...(dimensions === null
									? {}
									: {width: dimensions.width, height: dimensions.height}),
							},
						}
					: {}),
			},
		});
	} else {
		const props: Record<string, CodemodValue> = Object.fromEntries(
			element.props.map((prop) => [prop.name, toCodemodValue(prop.value)]),
		);
		if (from !== null) {
			props.from = from;
		}

		const {style, ...propsWithoutStyle} = props;
		if (positioned && style !== undefined) {
			if (typeof style !== 'object' || style === null || Array.isArray(style)) {
				throw new Error('Component style must be an object to add a position');
			}
		}

		inner = createElement({
			component: element.componentName,
			importName: element.importName,
			importPath: element.importPath,
			props: positioned
				? {
						...propsWithoutStyle,
						style: {
							...Object.fromEntries(
								Object.entries(
									(style as Record<string, CodemodValue> | undefined) ?? {},
								).filter(
									([key]) =>
										key !== 'position' &&
										(element.position === null || key !== 'translate'),
								),
							),
							...getPositionStyle(element.position),
						},
					}
				: props,
		});
	}

	if (sequence === null) {
		return inner;
	}

	return createElement({
		component: 'Sequence',
		importPath: 'remotion',
		props: {
			...(sequence.from === null ? {} : {from: sequence.from}),
			...(sequence.name === null ? {} : {name: sequence.name}),
			...(sequence.dimensions === null
				? {}
				: {
						width: sequence.dimensions.width,
						height: sequence.dimensions.height,
					}),
			...(sequence.durationInFrames === null
				? {}
				: {durationInFrames: sequence.durationInFrames}),
			style: getPositionStyle(sequence.position),
		},
		children: [inner],
	});
};
