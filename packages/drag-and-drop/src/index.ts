import {
	areComponentProps,
	isComponentIdentifier,
	isComponentImportPath,
} from './component-drag-data';
import {makeDragData, parseDragData} from './drag-data';
import {getDragPreviewMetadata} from './drag-preview-metadata';
import {
	getElementComponentNameFromSourceCode,
	makeElementFileNameFromSlug,
} from './element-drag-data';

export type {AssetDragData} from './asset-drag-data';
export type {
	ComponentDimensions,
	ComponentDragData,
	ComponentProp,
} from './component-drag-data';
export type {CompositionDragData} from './composition-drag-data';
export type {
	ConstructedDragData,
	DragDataTransfer,
	MakeAssetDragDataInput,
	MakeComponentDragDataInput,
	MakeCompositionDragDataInput,
	MakeDragDataInput,
	MakeEffectDragDataInput,
	MakeElementDragDataInput,
	MakeSfxDragDataInput,
	ParsedDragData,
	RemotionDragData,
	SerializedDragData,
} from './drag-data';
export type {
	AssetDragPreviewMetadata,
	ComponentDragPreviewMetadata,
	CompositionDragPreviewMetadata,
	DragPreviewMetadata,
	DragPreviewMetadataWithMimeType,
	EffectDragPreviewMetadata,
	ElementDragPreviewMetadata,
	SfxDragPreviewMetadata,
} from './drag-preview-metadata';
export type {EffectDragData} from './effect-drag-data';
export type {ElementDragData} from './element-drag-data';
export type {SfxDragData} from './sfx-drag-data';

export const DragAndDropInternals = {
	areComponentProps,
	getDragPreviewMetadata,
	getElementComponentNameFromSourceCode,
	isComponentIdentifier,
	isComponentImportPath,
	makeDragData,
	makeElementFileNameFromSlug,
	parseDragData,
};
