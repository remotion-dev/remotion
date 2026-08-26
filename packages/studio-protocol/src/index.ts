import {
	makeBrowserStudioUrl,
	openInBrowserStudio,
	parseBrowserStudioHash,
} from './browser-studio-link';
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
	MakeRenderOutputDragDataInput,
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
	RenderOutputDragPreviewMetadata,
	SfxDragPreviewMetadata,
} from './drag-preview-metadata';
export {setStudioDragData} from './drag-transport';
export type {EffectDragData} from './effect-drag-data';
export type {
	ElementDependency,
	ElementDragData,
	ElementInstallationMode,
} from './element-drag-data';
export type {RenderOutputDragData} from './render-output-drag-data';
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
export {isInsideStudio} from './is-inside-studio';
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
	makeBrowserStudioUrl,
	makeDragData,
	makeElementFileNameFromSlug,
	openInBrowserStudio,
	parseBrowserStudioHash,
	parseDragData,
	parseStudioElementPayload,
	setLicenseKeyInStudio,
};
