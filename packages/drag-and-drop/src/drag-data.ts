import {
	makeAssetDragData,
	parseAssetDragData,
	type AssetDragData,
} from './asset-drag-data';
import {
	makeComponentDragData,
	parseComponentDragData,
	type ComponentDimensions,
	type ComponentDragData,
	type ComponentProp,
} from './component-drag-data';
import {
	makeCompositionDragData,
	parseCompositionDragData,
	type CompositionDragData,
} from './composition-drag-data';
import {
	getDragPreviewMetadata,
	makeDragMimeType,
	parseDragMimeType,
	type AssetDragPreviewMetadata,
	type ComponentDragPreviewMetadata,
	type CompositionDragPreviewMetadata,
	type DragPreviewMetadata,
	type EffectDragPreviewMetadata,
	type ElementDragPreviewMetadata,
	type SfxDragPreviewMetadata,
} from './drag-preview-metadata';
import {
	makeEffectDragData,
	parseEffectDragData,
	type EffectDragData,
} from './effect-drag-data';
import {
	makeElementDragData,
	parseElementDragData,
	type ElementDragData,
} from './element-drag-data';
import {
	makeSfxDragData,
	parseSfxDragData,
	type SfxDragData,
} from './sfx-drag-data';

export type MakeAssetDragDataInput = {
	readonly type: 'asset';
	readonly assetPath: string;
	readonly width?: number;
	readonly height?: number;
	readonly durationInSeconds?: number;
};

export type MakeComponentDragDataInput = {
	readonly type: 'component';
	readonly componentName: string;
	readonly dimensions?: ComponentDimensions | null;
	readonly importName: string;
	readonly importPath: string;
	readonly props: ComponentProp[];
};

export type MakeCompositionDragDataInput = {
	readonly type: 'composition';
	readonly compositionFile: string | null;
	readonly compositionId: string;
	readonly width?: number;
	readonly height?: number;
	readonly durationInFrames?: number;
};

export type MakeEffectDragDataInput = EffectDragData['effect'] & {
	readonly type: 'effect';
};

export type MakeElementDragDataInput = ElementDragData['element'] & {
	readonly type: 'element';
	readonly durationInFrames: number;
};

export type MakeSfxDragDataInput = SfxDragData['sfx'] & {
	readonly type: 'sfx';
};

export type MakeDragDataInput =
	| MakeAssetDragDataInput
	| MakeComponentDragDataInput
	| MakeCompositionDragDataInput
	| MakeEffectDragDataInput
	| MakeElementDragDataInput
	| MakeSfxDragDataInput;

export type ConstructedDragData<
	TData extends RemotionDragData = RemotionDragData,
> = {
	readonly mimeType: string;
	readonly payload: string;
	readonly data: TData;
};

export type SerializedDragData = Pick<
	ConstructedDragData,
	'mimeType' | 'payload'
>;

export type DragDataTransfer = {
	readonly types: ArrayLike<string>;
	readonly getData: (mimeType: string) => string;
};

export type RemotionDragData =
	| AssetDragData
	| ComponentDragData
	| CompositionDragData
	| EffectDragData
	| ElementDragData
	| SfxDragData;

export type ParsedDragData =
	| {
			readonly type: 'asset';
			readonly data: AssetDragData;
			readonly preview: AssetDragPreviewMetadata;
	  }
	| {
			readonly type: 'component';
			readonly data: ComponentDragData;
			readonly preview: ComponentDragPreviewMetadata;
	  }
	| {
			readonly type: 'composition';
			readonly data: CompositionDragData;
			readonly preview: CompositionDragPreviewMetadata;
	  }
	| {
			readonly type: 'effect';
			readonly data: EffectDragData;
			readonly preview: EffectDragPreviewMetadata;
	  }
	| {
			readonly type: 'element';
			readonly data: ElementDragData;
			readonly preview: ElementDragPreviewMetadata;
	  }
	| {
			readonly type: 'sfx';
			readonly data: SfxDragData;
			readonly preview: SfxDragPreviewMetadata;
	  };

const construct = <TData extends RemotionDragData>(
	data: TData,
	preview: DragPreviewMetadata,
): ConstructedDragData<TData> => {
	return {
		mimeType: makeDragMimeType(preview),
		payload: JSON.stringify(data),
		data,
	};
};

type MakeDragData = {
	(input: MakeAssetDragDataInput): ConstructedDragData<AssetDragData>;
	(input: MakeComponentDragDataInput): ConstructedDragData<ComponentDragData>;
	(
		input: MakeCompositionDragDataInput,
	): ConstructedDragData<CompositionDragData>;
	(input: MakeEffectDragDataInput): ConstructedDragData<EffectDragData>;
	(input: MakeElementDragDataInput): ConstructedDragData<ElementDragData>;
	(input: MakeSfxDragDataInput): ConstructedDragData<SfxDragData>;
	(input: MakeDragDataInput): ConstructedDragData;
};

export const makeDragData = ((
	input: MakeDragDataInput,
): ConstructedDragData => {
	switch (input.type) {
		case 'asset':
			return construct(makeAssetDragData(input.assetPath), {
				type: input.type,
				width: input.width,
				height: input.height,
				durationInSeconds: input.durationInSeconds,
			});
		case 'component':
			return construct(
				makeComponentDragData({
					componentName: input.componentName,
					dimensions: input.dimensions,
					importName: input.importName,
					importPath: input.importPath,
					props: input.props,
				}),
				{
					type: input.type,
					...(input.dimensions ?? {}),
				},
			);
		case 'composition':
			return construct(
				makeCompositionDragData({
					compositionFile: input.compositionFile,
					compositionId: input.compositionId,
				}),
				{
					type: input.type,
					width: input.width,
					height: input.height,
					durationInFrames: input.durationInFrames,
				},
			);
		case 'effect':
			return construct(
				makeEffectDragData({
					name: input.name,
					importPath: input.importPath,
					config: input.config,
				}),
				{type: input.type},
			);
		case 'element':
			return construct(
				makeElementDragData({
					dependencies: input.dependencies,
					dimensions: input.dimensions,
					displayName: input.displayName,
					slug: input.slug,
					sourceCode: input.sourceCode,
				}),
				{
					type: input.type,
					...(input.dimensions ?? {}),
					durationInFrames: input.durationInFrames,
				},
			);
		case 'sfx':
			return construct(makeSfxDragData({name: input.name, url: input.url}), {
				type: input.type,
			});
		default:
			throw new TypeError('Unknown drag data type');
	}
}) as MakeDragData;

const dimensionsMatch = (
	preview: ComponentDragPreviewMetadata | ElementDragPreviewMetadata,
	dimensions: ComponentDimensions | null | undefined,
) => {
	if (dimensions === null || dimensions === undefined) {
		return preview.width === undefined && preview.height === undefined;
	}

	return (
		preview.width === dimensions.width && preview.height === dimensions.height
	);
};

export const parseDragData = (
	source: SerializedDragData | DragDataTransfer,
): ParsedDragData | null => {
	const {mimeType, payload} =
		'types' in source
			? (() => {
					const candidate = getDragPreviewMetadata(source.types);
					if (candidate === null) {
						return {mimeType: '', payload: ''};
					}

					return {
						mimeType: candidate.mimeType,
						payload: source.getData(candidate.mimeType),
					};
				})()
			: source;
	const preview = parseDragMimeType(mimeType);
	if (preview === null) {
		return null;
	}

	switch (preview.type) {
		case 'asset': {
			const data = parseAssetDragData(payload);

			return data === null ? null : {type: preview.type, data, preview};
		}

		case 'component': {
			const data = parseComponentDragData(payload);
			if (
				data === null ||
				!dimensionsMatch(preview, data.component.dimensions)
			) {
				return null;
			}

			return {type: preview.type, data, preview};
		}

		case 'composition': {
			const data = parseCompositionDragData(payload);

			return data === null ? null : {type: preview.type, data, preview};
		}

		case 'effect': {
			const data = parseEffectDragData(payload);

			return data === null ? null : {type: preview.type, data, preview};
		}

		case 'element': {
			const data = parseElementDragData(payload);
			if (!data || !dimensionsMatch(preview, data.element.dimensions)) {
				return null;
			}

			return {type: preview.type, data, preview};
		}

		case 'sfx': {
			const data = parseSfxDragData(payload);

			return data === null ? null : {type: preview.type, data, preview};
		}

		default:
			return null;
	}
};
