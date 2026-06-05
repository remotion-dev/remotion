import {
	detectFileType,
	getRequiredPackageForInsertableElement,
	type DownloadRemoteAssetResponse,
	type FileType,
	type InsertableCompositionElement,
} from '@remotion/studio-shared';
import {getStaticFiles} from '../api/get-static-files';
import {writeStaticFile} from '../api/write-static-file';
import {installRequiredPackages} from '../helpers/install-required-package';
import {callApi} from './call-api';
import {showNotification} from './Notifications/NotificationCenter';

export const getAssetElement = ({
	fileType,
	src,
}: {
	fileType: FileType;
	src: string;
}): InsertableCompositionElement | null => {
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
			dimensions: fileType.dimensions,
		};
	}

	if (fileType.type === 'gif') {
		return {
			type: 'asset',
			assetType: 'gif',
			src,
			dimensions: fileType.dimensions,
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
			dimensions: null,
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
			dimensions: null,
		};
	}

	return null;
};

export const getAssetElementFromPath = (
	assetPath: string,
): InsertableCompositionElement | null => {
	if (!assetPath || assetPath.includes('\\')) {
		return null;
	}

	const extension = assetPath.split('.').pop()?.toLowerCase();
	if (!extension || extension === assetPath.toLowerCase()) {
		return null;
	}

	if (['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(extension)) {
		return {
			type: 'asset',
			assetType: 'image',
			src: assetPath,
			dimensions: null,
		};
	}

	if (extension === 'gif') {
		return {
			type: 'asset',
			assetType: 'gif',
			src: assetPath,
			dimensions: null,
		};
	}

	if (['mp4', 'm4v', 'mov', 'avi', 'webm', 'ts', 'm2ts'].includes(extension)) {
		return {
			type: 'asset',
			assetType: 'video',
			src: assetPath,
			dimensions: null,
		};
	}

	if (['wav', 'mp3', 'aac', 'flac'].includes(extension)) {
		return {
			type: 'asset',
			assetType: 'audio',
			src: assetPath,
			dimensions: null,
		};
	}

	return null;
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

	if (element.assetType === 'audio') {
		return '<Audio>';
	}

	throw new Error('Unsupported asset type');
};

export const pickFilesToImport = (): Promise<File[]> => {
	return new Promise((resolve) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
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

const downloadRemoteAsset = async (
	url: string,
): Promise<DownloadRemoteAssetResponse> => {
	return callApi('/api/download-remote-asset', {url});
};

export const importAssets = async ({
	compositionFile,
	compositionId,
	files,
}: {
	compositionFile: string;
	compositionId: string;
	files: File[];
}) => {
	if (files.length === 0) {
		return;
	}

	const staticFiles = getStaticFiles();
	const differentExistingFile = files.find((file) => {
		return staticFiles.some(
			(staticFile) =>
				staticFile.name === file.name && staticFile.sizeInBytes !== file.size,
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
			const element = getAssetElement({
				fileType,
				src: file.name,
			});

			if (element === null) {
				unsupportedFiles.push(file.name);
				continue;
			}

			const alreadyExists = staticFiles.some(
				(staticFile) =>
					staticFile.name === file.name && staticFile.sizeInBytes === file.size,
			);

			if (!alreadyExists) {
				await writeStaticFile({
					contents,
					filePath: file.name,
				});
				addedStaticFiles.push(file.name);
			}

			const inserted = await insertAssetElement({
				compositionFile,
				compositionId,
				element,
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
	url,
}: {
	compositionFile: string;
	compositionId: string;
	url: string;
}) => {
	try {
		const {assetPath, created, element} = await downloadRemoteAsset(url);

		if (created) {
			showNotification(`Created ${assetPath} in public folder`, 3000);
		}

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
			`Could not add remote asset: ${
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
}: {
	assetPaths: string[];
	compositionFile: string;
	compositionId: string;
}) => {
	if (assetPaths.length === 0) {
		return;
	}

	const insertedLabels: string[] = [];
	const unsupportedFiles: string[] = [];

	try {
		for (const assetPath of assetPaths) {
			const element = getAssetElementFromPath(assetPath);
			if (element === null) {
				unsupportedFiles.push(assetPath);
				continue;
			}

			const inserted = await insertAssetElement({
				compositionFile,
				compositionId,
				element,
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
