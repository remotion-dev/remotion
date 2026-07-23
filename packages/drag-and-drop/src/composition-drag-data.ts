import {
	parseDragPreviewMetadataValue,
	type CompositionDragPreviewMetadata,
} from './drag-preview-metadata';
import {isRecord} from './validation';

export type CompositionDragData = {
	type: 'remotion-composition';
	version: 1;
	compositionId: string;
	compositionFile: string | null;
	preview: CompositionDragPreviewMetadata;
};

const isCompositionId = (value: unknown): value is string => {
	return (
		typeof value === 'string' &&
		value.length > 0 &&
		value.length < 500 &&
		/^([a-zA-Z0-9-\u4E00-\u9FFF])+$/.test(value)
	);
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
		!value.split('/').includes('..')
	);
};

export const makeCompositionDragData = ({
	compositionFile,
	compositionId,
	durationInFrames,
	height,
	width,
}: {
	compositionFile: string | null;
	compositionId: string;
	durationInFrames?: number;
	height?: number;
	width?: number;
}): CompositionDragData => {
	const preview = parseDragPreviewMetadataValue({
		kind: 'composition',
		...(width === undefined && height === undefined ? {} : {width, height}),
		...(durationInFrames === undefined ? {} : {durationInFrames}),
	});
	if (preview === null || preview.kind !== 'composition') {
		throw new TypeError('Invalid composition drag preview metadata');
	}

	return {
		type: 'remotion-composition',
		version: 1,
		compositionFile,
		compositionId,
		preview,
	};
};

export const parseCompositionDragData = (
	value: string,
): CompositionDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (
			!isRecord(parsed) ||
			parsed.type !== 'remotion-composition' ||
			parsed.version !== 1 ||
			!isCompositionId(parsed.compositionId) ||
			!isCompositionFile(parsed.compositionFile) ||
			(parsed.preview !== undefined &&
				parseDragPreviewMetadataValue(parsed.preview)?.kind !== 'composition')
		) {
			return null;
		}

		const preview =
			parsed.preview === undefined
				? {kind: 'composition' as const}
				: parseDragPreviewMetadataValue(parsed.preview);
		if (preview === null || preview.kind !== 'composition') {
			return null;
		}

		return makeCompositionDragData({
			compositionFile: parsed.compositionFile,
			compositionId: parsed.compositionId,
			width: preview.width,
			height: preview.height,
			durationInFrames: preview.durationInFrames,
		});
	} catch {
		return null;
	}
};
