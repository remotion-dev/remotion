import type {
	CompositionOrFolder,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';

const MIME_TYPE = 'application/remotion-composition-selector-reorder';

export type CompositionSelectorDragData = {
	readonly type: 'remotion-composition-selector';
	readonly version: 1;
	readonly item: CompositionOrFolder;
	readonly sourceFile: string | null;
};

export type CompositionSelectorActiveDrag = {
	readonly item: CompositionOrFolder;
	readonly parentFolderPath: string | null;
};

type DragDataTransfer = {
	readonly types: ArrayLike<string>;
	readonly getData: (mimeType: string) => string;
};

const isSafeString = (value: unknown, maxLength: number): value is string => {
	return (
		typeof value === 'string' &&
		value.length > 0 &&
		value.length <= maxLength &&
		!value.includes('\0')
	);
};

const isCompositionOrFolder = (
	value: unknown,
): value is CompositionOrFolder => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const item = value as Record<string, unknown>;
	if (item.type === 'composition') {
		return isSafeString(item.compositionId, 500);
	}

	return (
		item.type === 'folder' &&
		isSafeString(item.folderName, 500) &&
		(item.parentName === null || isSafeString(item.parentName, 2000))
	);
};

const isSafeSourceFile = (value: unknown): value is string | null => {
	return (
		value === null ||
		(isSafeString(value, 2000) &&
			!value.includes('\\') &&
			!value.startsWith('/') &&
			!value.split('/').includes('..'))
	);
};

export const makeCompositionSelectorDragData = ({
	item,
	sourceFile,
}: {
	readonly item: CompositionOrFolder;
	readonly sourceFile: string | null;
}) => {
	const data: CompositionSelectorDragData = {
		type: 'remotion-composition-selector',
		version: 1,
		item,
		sourceFile,
	};
	return {mimeType: MIME_TYPE, payload: JSON.stringify(data), data};
};

export const hasCompositionSelectorDragData = (
	mimeTypes: ArrayLike<string>,
) => {
	return Array.from(mimeTypes).includes(MIME_TYPE);
};

export const parseCompositionSelectorDragData = (
	dataTransfer: DragDataTransfer,
): CompositionSelectorDragData | null => {
	if (!hasCompositionSelectorDragData(dataTransfer.types)) {
		return null;
	}

	try {
		const parsed = JSON.parse(dataTransfer.getData(MIME_TYPE)) as Record<
			string,
			unknown
		>;
		if (
			parsed.type !== 'remotion-composition-selector' ||
			parsed.version !== 1 ||
			!isCompositionOrFolder(parsed.item) ||
			!isSafeSourceFile(parsed.sourceFile)
		) {
			return null;
		}

		return {
			type: 'remotion-composition-selector',
			version: 1,
			item: parsed.item,
			sourceFile: parsed.sourceFile,
		};
	} catch {
		return null;
	}
};

export const compositionSelectorDragDataToSymbolicatedStack = (
	dragData: CompositionSelectorDragData,
): SymbolicatedStackFrame | null => {
	if (dragData.sourceFile === null) {
		return null;
	}

	return {
		originalColumnNumber: null,
		originalFileName: dragData.sourceFile,
		originalFunctionName: null,
		originalLineNumber: null,
		originalScriptCode: null,
	};
};
