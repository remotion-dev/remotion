// Browser Blob and file-drag implementations have different upper bounds.
// Stay at the lowest broadly established desktop limit instead of advertising a
// drag that may fail only after the user has left the page.
export const MAXIMUM_SAFE_FILE_DRAG_SIZE = 500 * 1024 * 1024;
export const CONVERTED_OUTPUT_DRAG_TYPE =
	'application/x-remotion-converted-output';

export const isFileDragEligible = ({
	fileSize,
	isFileSystemBacked,
}: {
	readonly fileSize: number;
	readonly isFileSystemBacked: boolean;
}) => {
	return (
		isFileSystemBacked &&
		fileSize > 0 &&
		fileSize <= MAXIMUM_SAFE_FILE_DRAG_SIZE
	);
};

export const canOfferFileDrag = ({
	fileSize,
	isFileSystemBacked,
}: {
	readonly fileSize: number;
	readonly isFileSystemBacked: boolean;
}) => {
	if (!isFileDragEligible({fileSize, isFileSystemBacked})) {
		return false;
	}

	if (
		typeof window === 'undefined' ||
		typeof DataTransfer === 'undefined' ||
		typeof File === 'undefined' ||
		typeof URL.createObjectURL !== 'function' ||
		navigator.maxTouchPoints > 0 ||
		!window.matchMedia('(any-pointer: fine)').matches
	) {
		return false;
	}

	try {
		const dataTransfer = new DataTransfer();
		const item = dataTransfer.items.add(
			new File([], 'remotion-file-drag-probe'),
		);
		return item !== null && dataTransfer.files.length === 1;
	} catch {
		return false;
	}
};

export const setFileDragData = ({
	dataTransfer,
	file,
	fileName,
	objectUrl,
}: {
	readonly dataTransfer: DataTransfer;
	readonly file: File;
	readonly fileName: string;
	readonly objectUrl: string;
}) => {
	try {
		dataTransfer.clearData();
		dataTransfer.effectAllowed = 'copy';
		const fileForDrag =
			file.name === fileName
				? file
				: new File([file], fileName, {
						lastModified: file.lastModified,
						type: file.type,
					});
		const item = dataTransfer.items.add(fileForDrag);
		if (item === null) {
			return false;
		}

		// Chromium uses this non-standard type when the drag crosses a browser
		// window or leaves the browser. Other browsers safely ignore it and use
		// the standards-based File item above.
		dataTransfer.setData(
			'DownloadURL',
			`${fileForDrag.type || 'application/octet-stream'}:${fileForDrag.name}:${objectUrl}`,
		);
		dataTransfer.setData(CONVERTED_OUTPUT_DRAG_TYPE, '1');
		return true;
	} catch {
		return false;
	}
};
