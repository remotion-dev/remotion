const getClipboardFiles = (clipboardData: DataTransfer): File[] => {
	const imageItems = Array.from(clipboardData.items).filter(
		(item) => item.kind === 'file' && item.type.startsWith('image/'),
	);

	if (imageItems.length > 0) {
		const files = imageItems
			.map((item) => item.getAsFile())
			.filter((file): file is File => file !== null);
		if (files.length > 0) {
			return files;
		}
	}

	return Array.from(clipboardData.files).filter((file) =>
		file.type.startsWith('image/'),
	);
};

export const hasClipboardImage = (clipboardData: DataTransfer): boolean => {
	return (
		Array.from(clipboardData.items).some(
			(item) => item.kind === 'file' && item.type.startsWith('image/'),
		) ||
		Array.from(clipboardData.files).some((file) =>
			file.type.startsWith('image/'),
		)
	);
};

const getExtensionForMimeType = (mimeType: string): string => {
	switch (mimeType) {
		case 'image/jpeg':
			return 'jpg';
		case 'image/svg+xml':
			return 'svg';
		default:
			return mimeType.startsWith('image/')
				? mimeType.slice('image/'.length)
				: 'png';
	}
};

const getNameParts = ({
	fileName,
	mimeType,
}: {
	fileName: string;
	mimeType: string;
}): {base: string; extension: string} => {
	const trimmedName = fileName.trim();
	const lastDot = trimmedName.lastIndexOf('.');
	if (lastDot > 0 && lastDot < trimmedName.length - 1) {
		return {
			base: trimmedName.slice(0, lastDot),
			extension: trimmedName.slice(lastDot + 1),
		};
	}

	return {
		base: 'pasted-image',
		extension: getExtensionForMimeType(mimeType),
	};
};

export const getUniqueClipboardImageName = ({
	existingFileNames,
	fileName,
	mimeType,
}: {
	existingFileNames: Set<string>;
	fileName: string;
	mimeType: string;
}): string => {
	const {base, extension} = getNameParts({fileName, mimeType});
	let candidate = `${base}.${extension}`;
	let suffix = 1;

	while (existingFileNames.has(candidate)) {
		candidate = `${base}-${suffix}.${extension}`;
		suffix++;
	}

	return candidate;
};

export const getClipboardImageFiles = ({
	clipboardData,
	existingFileNames,
}: {
	clipboardData: DataTransfer;
	existingFileNames: string[];
}): File[] => {
	const usedNames = new Set(existingFileNames);

	return getClipboardFiles(clipboardData).map((file) => {
		const candidate = getUniqueClipboardImageName({
			existingFileNames: usedNames,
			fileName: file.name ?? '',
			mimeType: file.type,
		});

		usedNames.add(candidate);
		if (candidate === file.name) {
			return file;
		}

		return new File([file.slice()], candidate, {
			type: file.type,
			lastModified: file.lastModified,
		});
	});
};
