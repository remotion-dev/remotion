import {getVideoMetadata} from '@remotion/media-utils';
import {
	detectFileType,
	getRequiredPackageForInsertableElement,
	isUrl,
	type CompositionDragData,
	type ComponentDragData,
	type ComponentProp,
	type DownloadRemoteAssetResponse,
	type ElementDragData,
	type FileType,
	type InsertableCompositionElement,
	type InsertableCompositionElementPosition,
} from '@remotion/studio-shared';
import {Internals, staticFile} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {getStaticFiles} from '../api/get-static-files';
import {writeStaticFile} from '../api/write-static-file';
import {installRequiredPackages} from '../helpers/install-required-package';
import type {Dimensions} from '../helpers/is-current-selected-still';
import {callApi} from './call-api';
import {showNotification} from './Notifications/NotificationCenter';

export type InsertElementDropPosition = {
	readonly centerX: number;
	readonly centerY: number;
};

type InsertableAssetElement = Extract<
	InsertableCompositionElement,
	{type: 'asset'}
>;

export const getAssetElement = ({
	fileType,
	src,
}: {
	fileType: FileType;
	src: string;
}): InsertableAssetElement | null => {
	if (fileType.type === 'webp' && fileType.animated) {
		return {
			type: 'asset',
			assetType: 'animated-image',
			src,
			srcType: 'static',
			dimensions: fileType.dimensions,
			position: null,
		};
	}

	if (
		fileType.type === 'png' ||
		fileType.type === 'jpeg' ||
		fileType.type === 'webp' ||
		fileType.type === 'bmp'
	) {
		return {
			type: 'asset',
			assetType: 'image',
			src,
			srcType: 'static',
			dimensions: fileType.dimensions,
			position: null,
		};
	}

	if (fileType.type === 'apng') {
		return {
			type: 'asset',
			assetType: 'animated-image',
			src,
			srcType: 'static',
			dimensions: fileType.dimensions,
			position: null,
		};
	}

	if (fileType.type === 'gif') {
		return {
			type: 'asset',
			assetType: 'gif',
			src,
			srcType: 'static',
			dimensions: fileType.dimensions,
			position: null,
		};
	}

	if (
		fileType.type === 'riff' ||
		fileType.type === 'webm' ||
		fileType.type === 'iso-base-media' ||
		fileType.type === 'transport-stream'
	) {
		return {
			type: 'asset',
			assetType: 'video',
			src,
			srcType: 'static',
			dimensions: null,
			position: null,
		};
	}

	if (
		fileType.type === 'wav' ||
		fileType.type === 'mp3' ||
		fileType.type === 'aac' ||
		fileType.type === 'flac'
	) {
		return {
			type: 'asset',
			assetType: 'audio',
			src,
			srcType: 'static',
			dimensions: null,
			position: null,
		};
	}

	return null;
};

export const getAssetElementFromPath = (
	assetPath: string,
): InsertableAssetElement | null => {
	if (!assetPath || assetPath.includes('\\')) {
		return null;
	}

	const extension = assetPath.split('.').pop()?.toLowerCase();
	if (!extension || extension === assetPath.toLowerCase()) {
		return null;
	}

	if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'svg'].includes(extension)) {
		return {
			type: 'asset',
			assetType: 'image',
			src: assetPath,
			srcType: 'static',
			dimensions: null,
			position: null,
		};
	}

	if (extension === 'apng') {
		return {
			type: 'asset',
			assetType: 'animated-image',
			src: assetPath,
			srcType: 'static',
			dimensions: null,
			position: null,
		};
	}

	if (extension === 'gif') {
		return {
			type: 'asset',
			assetType: 'gif',
			src: assetPath,
			srcType: 'static',
			dimensions: null,
			position: null,
		};
	}

	if (['mp4', 'm4v', 'mov', 'avi', 'webm', 'ts', 'm2ts'].includes(extension)) {
		return {
			type: 'asset',
			assetType: 'video',
			src: assetPath,
			srcType: 'static',
			dimensions: null,
			position: null,
		};
	}

	if (['wav', 'mp3', 'aac', 'flac'].includes(extension)) {
		return {
			type: 'asset',
			assetType: 'audio',
			src: assetPath,
			srcType: 'static',
			dimensions: null,
			position: null,
		};
	}

	return null;
};

export const getAssetElementForDroppedFile = ({
	fileType,
	src,
}: {
	fileType: FileType;
	src: string;
}): InsertableAssetElement | null => {
	const detectedElement = getAssetElement({fileType, src});
	if (detectedElement !== null) {
		return detectedElement;
	}

	if (fileType.type !== 'unknown' || !src.toLowerCase().endsWith('.svg')) {
		return null;
	}

	return getAssetElementFromPath(src);
};

const getAssetLabel = (element: InsertableCompositionElement) => {
	if (element.type !== 'asset') {
		throw new Error('Expected asset element');
	}

	if (element.assetType === 'image') {
		return '<Img>';
	}

	if (element.assetType === 'video') {
		return '<Video>';
	}

	if (element.assetType === 'gif') {
		return '<Gif>';
	}

	if (element.assetType === 'animated-image') {
		return '<AnimatedImage>';
	}

	if (element.assetType === 'audio') {
		return '<Audio>';
	}

	throw new Error('Unsupported asset type');
};

const getComponentLabel = (component: ComponentDragData['component']) => {
	return `<${component.componentName}>`;
};

const getCenteredPosition = ({
	dimensions,
	dropPosition,
}: {
	dimensions: Dimensions | null;
	dropPosition: InsertElementDropPosition | null;
}): InsertableCompositionElementPosition | null => {
	if (dropPosition === null) {
		return null;
	}

	if (dimensions === null) {
		return {
			x: dropPosition.centerX,
			y: dropPosition.centerY,
		};
	}

	return {
		x: dropPosition.centerX - dimensions.width / 2,
		y: dropPosition.centerY - dimensions.height / 2,
	};
};

export const getElementPositionForDrop = ({
	dimensions,
	dropPosition,
}: {
	dimensions: Dimensions | null;
	dropPosition: InsertElementDropPosition | null;
}): InsertableCompositionElementPosition | null => {
	if (dimensions === null) {
		return null;
	}

	return getCenteredPosition({dimensions, dropPosition});
};

export const getCompositionPositionForDrop = ({
	compositionDimensions,
	destinationDimensions,
	dropPosition,
}: {
	compositionDimensions: Dimensions;
	destinationDimensions: Dimensions | null;
	dropPosition: InsertElementDropPosition | null;
}): InsertableCompositionElementPosition | null => {
	// No translation makes an equal-sized composition fill the destination.
	if (
		destinationDimensions !== null &&
		compositionDimensions.width === destinationDimensions.width &&
		compositionDimensions.height === destinationDimensions.height
	) {
		return null;
	}

	return getCenteredPosition({
		dimensions: compositionDimensions,
		dropPosition,
	});
};

export const getAssetPositionForDrop = ({
	assetDimensions,
	destinationDimensions,
	dropPosition,
}: {
	assetDimensions: Dimensions | null;
	destinationDimensions: Dimensions | null;
	dropPosition: InsertElementDropPosition | null;
}): InsertableCompositionElementPosition | null => {
	if (
		assetDimensions !== null &&
		destinationDimensions !== null &&
		assetDimensions.width === destinationDimensions.width &&
		assetDimensions.height === destinationDimensions.height
	) {
		return null;
	}

	return getCenteredPosition({dimensions: assetDimensions, dropPosition});
};

const getComponentPropNumber = (props: ComponentProp[], name: string) => {
	const prop = props.find((p) => p.name === name);
	return typeof prop?.value === 'number' ? prop.value : null;
};

export const getComponentDimensions = (
	component: ComponentDragData['component'],
): Dimensions | null => {
	if (component.dimensions) {
		return component.dimensions;
	}

	const width = getComponentPropNumber(component.props, 'width');
	const height = getComponentPropNumber(component.props, 'height');
	if (width !== null && height !== null) {
		return {width, height};
	}

	const radius = getComponentPropNumber(component.props, 'radius');
	if (radius !== null) {
		return {width: radius * 2, height: radius * 2};
	}

	return null;
};

const getImageDimensions = ({
	revokeObjectUrl,
	src,
}: {
	revokeObjectUrl: boolean;
	src: string;
}): Promise<Dimensions> => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			if (revokeObjectUrl) {
				URL.revokeObjectURL(src);
			}

			resolve({width: image.naturalWidth, height: image.naturalHeight});
		};

		image.onerror = () => {
			if (revokeObjectUrl) {
				URL.revokeObjectURL(src);
			}

			reject(new Error('Failed to load image dimensions'));
		};

		image.src = src;
	});
};

const getVideoDimensions = async (src: string): Promise<Dimensions> => {
	const metadata = await getVideoMetadata(src);
	return {width: metadata.width, height: metadata.height};
};

const getFileDimensions = async ({
	file,
	fileType,
}: {
	file: File;
	fileType: FileType;
}): Promise<Dimensions | null> => {
	if (fileType.type === 'unknown' && file.name.toLowerCase().endsWith('.svg')) {
		const objectUrl = URL.createObjectURL(file);
		return getImageDimensions({revokeObjectUrl: true, src: objectUrl});
	}

	if (
		fileType.type === 'wav' ||
		fileType.type === 'mp3' ||
		fileType.type === 'aac' ||
		fileType.type === 'flac'
	) {
		return null;
	}

	if (
		fileType.type === 'png' ||
		fileType.type === 'jpeg' ||
		fileType.type === 'webp' ||
		fileType.type === 'bmp' ||
		fileType.type === 'apng' ||
		fileType.type === 'gif'
	) {
		if (fileType.dimensions) {
			return fileType.dimensions;
		}

		const objectUrl = URL.createObjectURL(file);
		return getImageDimensions({revokeObjectUrl: true, src: objectUrl});
	}

	if (
		fileType.type === 'riff' ||
		fileType.type === 'webm' ||
		fileType.type === 'iso-base-media' ||
		fileType.type === 'transport-stream'
	) {
		const objectUrl = URL.createObjectURL(file);
		try {
			return await getVideoDimensions(objectUrl);
		} finally {
			URL.revokeObjectURL(objectUrl);
		}
	}

	return null;
};

const getStaticAssetDimensions = (
	assetPath: string,
): Dimensions | Promise<Dimensions> | null => {
	const extension = assetPath.split('.').pop()?.toLowerCase();
	const src = staticFile(assetPath);

	if (
		extension &&
		['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'apng', 'svg'].includes(
			extension,
		)
	) {
		return getImageDimensions({revokeObjectUrl: false, src});
	}

	if (
		extension &&
		['mp4', 'm4v', 'mov', 'avi', 'webm', 'ts', 'm2ts'].includes(extension)
	) {
		return getVideoDimensions(src);
	}

	return null;
};

const getFileDimensionsOrNull = async ({
	file,
	fileType,
}: {
	file: File;
	fileType: FileType;
}): Promise<Dimensions | null> => {
	try {
		return await getFileDimensions({file, fileType});
	} catch {
		return null;
	}
};

const getStaticAssetDimensionsOrNull = async (
	assetPath: string,
): Promise<Dimensions | null> => {
	try {
		return await getStaticAssetDimensions(assetPath);
	} catch {
		return null;
	}
};

const getStaticAssetFileType = async (
	assetPath: string,
): Promise<FileType | null> => {
	const extension = assetPath.split('.').pop()?.toLowerCase();
	if (extension !== 'png' && extension !== 'apng' && extension !== 'webp') {
		return null;
	}

	try {
		const response = await fetch(staticFile(assetPath));
		if (!response.ok) {
			return null;
		}

		return detectFileType(new Uint8Array(await response.arrayBuffer()));
	} catch {
		return null;
	}
};

const getAssetElementFromStaticAsset = async (
	assetPath: string,
): Promise<InsertableAssetElement | null> => {
	const fileType = await getStaticAssetFileType(assetPath);
	if (fileType) {
		const element = getAssetElement({fileType, src: assetPath});
		if (element) {
			return element;
		}
	}

	return getAssetElementFromPath(assetPath);
};

export const pickFilesToImport = ({
	multiple = true,
}: {
	readonly multiple?: boolean;
} = {}): Promise<File[]> => {
	return new Promise((resolve) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = multiple;
		input.style.display = 'none';

		let didResolve = false;
		const resolveOnce = (files: File[]) => {
			if (didResolve) {
				return;
			}

			didResolve = true;
			input.removeEventListener('change', onChange);
			input.removeEventListener('cancel', onCancel);
			input.remove();
			resolve(files);
		};

		const onChange = () => resolveOnce(Array.from(input.files ?? []));
		const onCancel = () => resolveOnce([]);

		input.addEventListener('change', onChange);
		input.addEventListener('cancel', onCancel);
		document.body.appendChild(input);
		input.click();
	});
};

const notifyInsertedAssets = (insertedLabels: string[]) => {
	if (insertedLabels.length === 1) {
		showNotification(`Added ${insertedLabels[0]} to source file`, 2000);
	} else if (insertedLabels.length > 1) {
		showNotification(
			`Added ${insertedLabels.length} assets to source file`,
			2000,
		);
	}
};

const notifyUnsupportedFiles = (unsupportedFiles: string[]) => {
	if (unsupportedFiles.length === 1) {
		showNotification(
			`Cannot add ${unsupportedFiles[0]}: Unsupported file type`,
			3000,
		);
	} else if (unsupportedFiles.length > 1) {
		showNotification(
			`Skipped ${unsupportedFiles.length} unsupported files`,
			3000,
		);
	}
};

const insertAssetElement = async ({
	compositionFile,
	compositionId,
	element,
}: {
	compositionFile: string;
	compositionId: string;
	element: InsertableCompositionElement;
}) => {
	const requiredPackage = getRequiredPackageForInsertableElement(element);
	await installRequiredPackages(requiredPackage ? [requiredPackage] : []);

	const result = await callApi('/api/insert-jsx-element', {
		compositionFile,
		compositionId,
		element,
	});

	if (!result.success) {
		showNotification(result.reason, 4000);
		return false;
	}

	return true;
};

const downloadRemoteAsset = (
	url: string,
): Promise<DownloadRemoteAssetResponse> => {
	return callApi('/api/download-remote-asset', {url});
};

export const importAssets = async ({
	compositionFile,
	compositionId,
	destinationDimensions,
	dropPosition,
	files,
}: {
	compositionFile: string;
	compositionId: string;
	destinationDimensions: Dimensions | null;
	dropPosition: InsertElementDropPosition | null;
	files: File[];
}) => {
	if (files.length === 0) {
		return;
	}

	const staticFiles = getStaticFiles();
	const differentExistingFile = files.find((file) => {
		return staticFiles.some(
			(existingStaticFile) =>
				existingStaticFile.name === file.name &&
				existingStaticFile.sizeInBytes !== file.size,
		);
	});
	if (differentExistingFile) {
		showNotification(
			`File with name ${differentExistingFile.name} already exists and is different`,
			4000,
		);
		return;
	}

	const insertedLabels: string[] = [];
	const addedStaticFiles: string[] = [];
	const unsupportedFiles: string[] = [];
	const notifyAddedStaticFiles = () => {
		if (addedStaticFiles.length === 1) {
			showNotification(`Created ${addedStaticFiles[0]} in public folder`, 3000);
		} else if (addedStaticFiles.length > 1) {
			showNotification(
				`Added ${addedStaticFiles.length} files to public folder`,
				3000,
			);
		}

		addedStaticFiles.length = 0;
	};

	try {
		for (const file of files) {
			const contents = await file.arrayBuffer();
			const fileType = detectFileType(new Uint8Array(contents));
			const element = getAssetElementForDroppedFile({
				fileType,
				src: file.name,
			});

			if (element === null) {
				unsupportedFiles.push(file.name);
				continue;
			}

			const alreadyExists = staticFiles.some(
				(existingStaticFile) =>
					existingStaticFile.name === file.name &&
					existingStaticFile.sizeInBytes === file.size,
			);

			if (!alreadyExists) {
				await writeStaticFile({
					contents,
					filePath: file.name,
				});
				addedStaticFiles.push(file.name);
			}

			const dimensions = await getFileDimensionsOrNull({file, fileType});
			const resolvedDimensions = element.dimensions ?? dimensions;

			const inserted = await insertAssetElement({
				compositionFile,
				compositionId,
				element: {
					...element,
					dimensions: resolvedDimensions,
					position: getAssetPositionForDrop({
						assetDimensions: resolvedDimensions,
						destinationDimensions,
						dropPosition,
					}),
				},
			});

			if (!inserted) {
				notifyAddedStaticFiles();
				return;
			}

			insertedLabels.push(getAssetLabel(element));
		}

		notifyAddedStaticFiles();
		notifyInsertedAssets(insertedLabels);
		notifyUnsupportedFiles(unsupportedFiles);
	} catch (error) {
		showNotification(
			`Could not add asset: ${
				error instanceof Error ? error.message : String(error)
			}`,
			4000,
		);
	}
};

export const importRemoteAsset = async ({
	compositionFile,
	compositionId,
	destinationDimensions,
	dropPosition,
	url,
}: {
	compositionFile: string;
	compositionId: string;
	destinationDimensions: Dimensions | null;
	dropPosition: InsertElementDropPosition | null;
	url: string;
}) => {
	try {
		const {assetPath, created, element} = await downloadRemoteAsset(url);

		if (created) {
			showNotification(`Created ${assetPath} in public folder`, 3000);
		}

		if (element.type !== 'asset') {
			showNotification('Cannot add remote asset: Unsupported asset type', 3000);
			return;
		}

		const inserted = await insertAssetElement({
			compositionFile,
			compositionId,
			element: {
				...element,
				position: getAssetPositionForDrop({
					assetDimensions: element.dimensions,
					destinationDimensions,
					dropPosition,
				}),
			},
		});

		if (!inserted) {
			return;
		}

		notifyInsertedAssets([getAssetLabel(element)]);
	} catch (error) {
		showNotification(
			`Could not add remote asset: ${
				error instanceof Error ? error.message : String(error)
			}`,
			4000,
		);
	}
};

export const insertRemoteAudio = async ({
	compositionFile,
	compositionId,
	url,
}: {
	compositionFile: string;
	compositionId: string;
	url: string;
}) => {
	if (!isUrl(url)) {
		showNotification('Cannot add sound effect: Unsupported URL', 3000);
		return;
	}

	const element: InsertableCompositionElement = {
		type: 'asset',
		assetType: 'audio',
		src: url,
		srcType: 'remote',
		dimensions: null,
		position: null,
	};

	try {
		const inserted = await insertAssetElement({
			compositionFile,
			compositionId,
			element,
		});

		if (!inserted) {
			return;
		}

		notifyInsertedAssets([getAssetLabel(element)]);
	} catch (error) {
		showNotification(
			`Could not add sound effect: ${
				error instanceof Error ? error.message : String(error)
			}`,
			4000,
		);
	}
};

export const insertExistingAssets = async ({
	assetPaths,
	compositionFile,
	compositionId,
	destinationDimensions,
	dropPosition,
}: {
	assetPaths: string[];
	compositionFile: string;
	compositionId: string;
	destinationDimensions: Dimensions | null;
	dropPosition: InsertElementDropPosition | null;
}) => {
	if (assetPaths.length === 0) {
		return;
	}

	const insertedLabels: string[] = [];
	const unsupportedFiles: string[] = [];

	try {
		for (const assetPath of assetPaths) {
			const element = await getAssetElementFromStaticAsset(assetPath);
			if (element === null) {
				unsupportedFiles.push(assetPath);
				continue;
			}

			const dimensions =
				element.dimensions ?? (await getStaticAssetDimensionsOrNull(assetPath));

			const inserted = await insertAssetElement({
				compositionFile,
				compositionId,
				element: {
					...element,
					dimensions,
					position: getAssetPositionForDrop({
						assetDimensions: dimensions,
						destinationDimensions,
						dropPosition,
					}),
				},
			});

			if (!inserted) {
				return;
			}

			insertedLabels.push(getAssetLabel(element));
		}

		notifyInsertedAssets(insertedLabels);
		notifyUnsupportedFiles(unsupportedFiles);
	} catch (error) {
		showNotification(
			`Could not add asset: ${
				error instanceof Error ? error.message : String(error)
			}`,
			4000,
		);
	}
};

export const insertComponent = async ({
	component,
	compositionFile,
	compositionId,
	dropPosition,
}: {
	component: ComponentDragData['component'];
	compositionFile: string;
	compositionId: string;
	dropPosition: InsertElementDropPosition | null;
}) => {
	try {
		const inserted = await insertAssetElement({
			compositionFile,
			compositionId,
			element: {
				type: 'component',
				componentName: component.componentName,
				importName: component.importName,
				importPath: component.importPath,
				props: component.props,
				position: getCenteredPosition({
					dimensions: getComponentDimensions(component),
					dropPosition,
				}),
			},
		});

		if (!inserted) {
			return;
		}

		showNotification(
			`Added ${getComponentLabel(component)} to source file`,
			2000,
		);
	} catch (error) {
		showNotification(
			`Could not add component: ${
				error instanceof Error ? error.message : String(error)
			}`,
			4000,
		);
	}
};

const serializeResolvedPropsForSourceCode = (
	props: Record<string, unknown>,
) => {
	return NoReactInternals.serializeJSONWithSpecialTypes({
		data: props,
		indent: undefined,
		staticBase: window.remotion_staticBase,
	}).serializedString;
};

export const insertComposition = async ({
	composition,
	compositionFile,
	compositionId,
	destinationDimensions,
	dropPosition,
}: {
	composition: CompositionDragData;
	compositionFile: string;
	compositionId: string;
	destinationDimensions: Dimensions | null;
	dropPosition: InsertElementDropPosition | null;
}) => {
	if (composition.compositionId === compositionId) {
		showNotification('Cannot add a composition to itself', 3000);
		return;
	}

	if (composition.compositionFile === null) {
		showNotification('Could not find composition source file', 3000);
		return;
	}

	try {
		const resolver = Internals.resolveCompositionsRef.current;
		if (!resolver) {
			throw new Error('No composition resolver available');
		}

		const calculated = await resolver.resolveComposition(
			composition.compositionId,
		);
		const dimensions = {
			width: calculated.width,
			height: calculated.height,
		};
		const inserted = await insertAssetElement({
			compositionFile,
			compositionId,
			element: {
				type: 'composition',
				compositionId: composition.compositionId,
				compositionFile: composition.compositionFile,
				durationInFrames: calculated.durationInFrames,
				width: calculated.width,
				height: calculated.height,
				serializedResolvedPropsWithCustomSchema:
					serializeResolvedPropsForSourceCode(calculated.props),
				position: getCompositionPositionForDrop({
					compositionDimensions: dimensions,
					destinationDimensions,
					dropPosition,
				}),
			},
		});

		if (!inserted) {
			return;
		}

		showNotification(
			`Added ${composition.compositionId} to ${compositionId}`,
			2000,
		);
	} catch (error) {
		showNotification(
			`Could not add composition: ${
				error instanceof Error ? error.message : String(error)
			}`,
			4000,
		);
	}
};

export const insertElement = async ({
	compositionFile,
	compositionId,
	dropPosition,
	element,
}: {
	compositionFile: string;
	compositionId: string;
	dropPosition: InsertElementDropPosition | null;
	element: ElementDragData['element'];
}) => {
	try {
		await installRequiredPackages(element.dependencies);

		const response = await callApi('/api/insert-element', {
			compositionFile,
			compositionId,
			element,
			position: getElementPositionForDrop({
				dimensions: element.dimensions,
				dropPosition,
			}),
		});

		if (!response.success) {
			showNotification(`Could not add Element: ${response.reason}`, 4000);
			return;
		}

		showNotification(`Added ${element.displayName} to source file`, 2000);
	} catch (error) {
		showNotification(
			`Could not add Element: ${
				error instanceof Error ? error.message : String(error)
			}`,
			4000,
		);
	}
};
