export {COMPOSITION_DRAG_MIME_TYPE} from './drag-mime-types';

export type CompositionDragData = {
	type: 'remotion-composition';
	version: 1;
	compositionId: string;
	compositionFile: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isCompositionId = (value: unknown): value is string => {
	return (
		typeof value === 'string' &&
		value.length > 0 &&
		value.length < 500 &&
		/^([a-zA-Z0-9-\u4E00-\u9FFF])+$/.test(value)
	);
};

const hasParentDirectorySegment = (value: string) => {
	return value.split('/').includes('..');
};

const isCompositionFile = (value: unknown): value is string | null => {
	if (value === null) {
		return true;
	}

	return (
		typeof value === 'string' &&
		value.length > 0 &&
		value.length < 2000 &&
		!value.includes('\0') &&
		!value.includes('\\') &&
		!value.startsWith('/') &&
		!hasParentDirectorySegment(value)
	);
};

export const makeCompositionDragData = ({
	compositionFile,
	compositionId,
}: {
	compositionFile: string | null;
	compositionId: string;
}): CompositionDragData => {
	return {
		type: 'remotion-composition',
		version: 1,
		compositionFile,
		compositionId,
	};
};

export const parseCompositionDragData = (
	value: string,
): CompositionDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed)) {
			return null;
		}

		if (parsed.type !== 'remotion-composition' || parsed.version !== 1) {
			return null;
		}

		if (
			!isCompositionId(parsed.compositionId) ||
			!isCompositionFile(parsed.compositionFile)
		) {
			return null;
		}

		return makeCompositionDragData({
			compositionFile: parsed.compositionFile,
			compositionId: parsed.compositionId,
		});
	} catch {
		return null;
	}
};
