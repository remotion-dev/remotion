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
import {parseStudioElementPayload} from './element-payload';
import {installInStudioWithDependencies} from './install-in-studio';
import {isValidPublicLicenseKey} from './license-key';
import {setLicenseKeyInStudio} from './set-license-key-in-studio';

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
export {setStudioDragData} from './drag-transport';
export type {EffectDragData} from './effect-drag-data';
export type {
	ElementDependency,
	ElementDragData,
	ElementInstallationMode,
} from './element-drag-data';
export {
	createElementPayload,
	type CreateElementPayloadInput,
	type StudioElementPayload,
} from './element-payload';
export {
	installInStudio,
	type InstallInStudioErrorCode,
	type InstallInStudioResult,
} from './install-in-studio';
export type {SfxDragData} from './sfx-drag-data';
export type {
	StudioProtocolDescriptor,
	StudioProtocolInstallTarget,
} from './studio-discovery';

export const StudioProtocolInternals = {
	areComponentProps,
	getDragPreviewMetadata,
	getElementComponentNameFromSourceCode,
	isComponentIdentifier,
	isComponentImportPath,
	installInStudioWithDependencies,
	isValidPublicLicenseKey,
	makeDragData,
	makeElementFileNameFromSlug,
	parseDragData,
	parseStudioElementPayload,
	setLicenseKeyInStudio,
};
