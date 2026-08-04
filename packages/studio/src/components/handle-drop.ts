import type {Dimensions} from '../helpers/is-current-selected-still';
import {getRemoteAssetUrlFromDataTransfer} from '../helpers/remote-asset-drag';
import {
	getAssetDragPath,
	getComponentDragData,
	getCompositionDragData,
	getSfxDragUrl,
	isAssetDragEvent,
	isCompositionDragEvent,
	isFileDragEvent,
	isSfxDragEvent,
} from './drop-handler-data';
import {getElementDragData} from './element-drag-and-drop';
import {enqueueElementInstallRequest} from './element-install-request';
import {
	getElementPositionForDrop,
	getFromForDrop,
	hasSvgFile,
	importAssets,
	importRemoteAsset,
	insertComponent,
	insertComposition,
	insertExistingAssets,
	insertRemoteAudio,
	type InsertElementDropPosition,
} from './import-assets';
import type {SvgImportMode} from './SvgImportDialog';

export const handleDrop = async ({
	chooseSvgImportMode,
	compositionFile,
	compositionId,
	destinationDimensions,
	dropPosition,
	event,
	fps,
	from,
	preferCompositionStart,
}: {
	chooseSvgImportMode: () => Promise<SvgImportMode | null>;
	compositionFile: string;
	compositionId: string;
	destinationDimensions: Dimensions | null;
	dropPosition: InsertElementDropPosition | null;
	event: DragEvent;
	fps: number;
	from: number | null;
	preferCompositionStart: boolean;
}) => {
	if (isFileDragEvent(event)) {
		const files = Array.from(event.dataTransfer?.files ?? []);
		if (files.length === 0) {
			return;
		}

		const svgImportMode = hasSvgFile(files)
			? await chooseSvgImportMode()
			: 'image';
		if (svgImportMode === null) {
			return;
		}

		await importAssets({
			compositionFile,
			compositionId,
			destinationDimensions,
			dropPosition,
			files,
			fps,
			from,
			preferCompositionStart,
			svgImportMode,
		});
		return;
	}

	if (isAssetDragEvent(event)) {
		const assetPath = getAssetDragPath(event);
		if (assetPath === null) {
			return;
		}

		await insertExistingAssets({
			assetPaths: [assetPath],
			compositionFile,
			compositionId,
			destinationDimensions,
			dropPosition,
			fps,
			from,
			preferCompositionStart,
		});
		return;
	}

	if (isSfxDragEvent(event)) {
		const sfxUrl = getSfxDragUrl(event);
		if (sfxUrl === null) {
			return;
		}

		await insertRemoteAudio({
			compositionFile,
			compositionId,
			fps,
			from,
			preferCompositionStart,
			url: sfxUrl,
		});
		return;
	}

	if (isCompositionDragEvent(event)) {
		const composition = getCompositionDragData(event);
		if (composition === null) {
			return;
		}

		await insertComposition({
			composition,
			compositionFile,
			compositionId,
			dropPosition,
			from,
			preferCompositionStart,
		});
		return;
	}

	const element = getElementDragData(event.dataTransfer);
	if (element !== null) {
		enqueueElementInstallRequest({
			id: crypto.randomUUID(),
			clientId: 'drag-and-drop',
			createdAt: Date.now(),
			compositionFile,
			compositionId,
			element: element.element,
			from: getFromForDrop({
				durationInFrames: element.element.durationInFrames,
				from,
				preferCompositionStart,
			}),
			position: getElementPositionForDrop({
				dimensions: element.element.dimensions,
				dropPosition,
			}),
			source: {type: 'drag-and-drop'},
		});
		return;
	}

	const component = getComponentDragData(event);
	if (component !== null) {
		await insertComponent({
			component: component.component,
			compositionFile,
			compositionId,
			dropPosition,
			from,
			preferCompositionStart,
		});
		return;
	}

	const remoteAssetUrl = getRemoteAssetUrlFromDataTransfer(event.dataTransfer);
	if (remoteAssetUrl === null) {
		return;
	}

	await importRemoteAsset({
		compositionFile,
		compositionId,
		destinationDimensions,
		dropPosition,
		fps,
		from,
		preferCompositionStart,
		url: remoteAssetUrl,
	});
};
