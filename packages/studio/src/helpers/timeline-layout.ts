import type {SequenceControls, SequenceFieldSchema} from 'remotion';

export const TIMELINE_PADDING = 16;
export const TIMELINE_BORDER = 1;
export const TIMELINE_ITEM_BORDER_BOTTOM = 1;

export const TIMELINE_TRACK_EXPANDED_HEIGHT = 100;

export const SCHEMA_FIELD_ROW_HEIGHT = 22;
export const UNSUPPORTED_FIELD_ROW_HEIGHT = 22;

const SUPPORTED_SCHEMA_TYPES = new Set(['number', 'boolean']);

export type SchemaFieldInfo = {
	key: string;
	description: string | undefined;
	typeName: string;
	supported: boolean;
	rowHeight: number;
	currentValue: unknown;
	fieldSchema: SequenceFieldSchema;
};

export const getSchemaFields = (
	controls: SequenceControls | null,
): SchemaFieldInfo[] | null => {
	if (!controls) {
		return null;
	}

	return Object.entries(controls.schema).map(([key, fieldSchema]) => {
		const typeName = fieldSchema.type;
		const supported = SUPPORTED_SCHEMA_TYPES.has(typeName);
		return {
			key,
			description: fieldSchema.description,
			typeName,
			supported,
			rowHeight: supported
				? SCHEMA_FIELD_ROW_HEIGHT
				: UNSUPPORTED_FIELD_ROW_HEIGHT,
			currentValue: controls.currentValue[key],
			fieldSchema,
		};
	});
};

export const getExpandedTrackHeight = (
	controls: SequenceControls | null,
): number => {
	const fields = getSchemaFields(controls);
	if (!fields || fields.length === 0) {
		return TIMELINE_TRACK_EXPANDED_HEIGHT;
	}

	return fields.reduce((sum, f) => sum + f.rowHeight, 0);
};

export const getTimelineLayerHeight = (type: 'video' | 'other') => {
	if (type === 'video') {
		return 50;
	}

	return 25;
};
