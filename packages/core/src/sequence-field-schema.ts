export type HiddenFieldSchema = {
	type: 'hidden';
	keyframable?: boolean;
};

export type NumberFieldSchema = {
	type: 'number';
	min?: number;
	max?: number;
	step?: number;
	default: number | undefined;
	description?: string;
	hiddenFromList: boolean;
	keyframable?: boolean;
};

export type BooleanFieldSchema = {
	type: 'boolean';
	default: boolean;
	description?: string;
	keyframable?: boolean;
};

export type RotationCssFieldSchema = {
	type: 'rotation-css';
	step?: number;
	default: string | undefined;
	description?: string;
	keyframable?: boolean;
};

export type RotationDegreesFieldSchema = {
	type: 'rotation-degrees';
	min?: number;
	max?: number;
	step?: number;
	default: number | undefined;
	description?: string;
	keyframable?: boolean;
};

export type TranslateFieldSchema = {
	type: 'translate';
	step?: number;
	default: string | undefined;
	description?: string;
	keyframable?: boolean;
};

export type TransformOriginFieldSchema = {
	type: 'transform-origin';
	step?: number;
	default: string | undefined;
	description?: string;
	keyframable?: boolean;
};

export type ScaleFieldSchema = {
	type: 'scale';
	min?: number;
	max?: number;
	step?: number;
	default: number | string | undefined;
	description?: string;
	keyframable?: boolean;
};

export type UvCoordinateFieldSchema = {
	type: 'uv-coordinate';
	min?: number;
	max?: number;
	step?: number;
	lineTo?: string;
	default: readonly [number, number] | undefined;
	description?: string;
	keyframable?: boolean;
};

export type ColorFieldSchema = {
	type: 'color';
	default: string | undefined;
	description?: string;
	keyframable?: boolean;
};

export type EnumFieldSchema = {
	type: 'enum';
	default: string;
	description?: string;
	variants: Record<string, SequenceSchema>;
	keyframable?: boolean;
};

export type NumberArrayItemSchema = Omit<
	NumberFieldSchema,
	'default' | 'description' | 'hiddenFromList' | 'keyframable'
>;

export type BooleanArrayItemSchema = Omit<
	BooleanFieldSchema,
	'default' | 'description' | 'keyframable'
>;

export type RotationCssArrayItemSchema = Omit<
	RotationCssFieldSchema,
	'default' | 'description' | 'keyframable'
>;

export type RotationDegreesArrayItemSchema = Omit<
	RotationDegreesFieldSchema,
	'default' | 'description' | 'keyframable'
>;

export type TranslateArrayItemSchema = Omit<
	TranslateFieldSchema,
	'default' | 'description' | 'keyframable'
>;

export type UvCoordinateArrayItemSchema = Omit<
	UvCoordinateFieldSchema,
	'default' | 'description' | 'keyframable'
>;

export type ColorArrayItemSchema = Omit<
	ColorFieldSchema,
	'default' | 'description' | 'keyframable'
>;

export type EnumArrayItemSchema = {
	type: 'enum';
	variants: readonly string[];
};

export type ArrayItemFieldSchema =
	| NumberArrayItemSchema
	| BooleanArrayItemSchema
	| RotationCssArrayItemSchema
	| RotationDegreesArrayItemSchema
	| TranslateArrayItemSchema
	| UvCoordinateArrayItemSchema
	| ColorArrayItemSchema
	| EnumArrayItemSchema;

export type ArrayFieldSchema = {
	type: 'array';
	item: ArrayItemFieldSchema;
	default: readonly unknown[] | undefined;
	minLength?: number;
	maxLength?: number;
	newItemDefault: unknown;
	description?: string;
	keyframable?: false;
};

export type VisibleFieldSchema =
	| NumberFieldSchema
	| BooleanFieldSchema
	| RotationCssFieldSchema
	| RotationDegreesFieldSchema
	| TranslateFieldSchema
	| TransformOriginFieldSchema
	| ScaleFieldSchema
	| UvCoordinateFieldSchema
	| ColorFieldSchema
	| ArrayFieldSchema
	| EnumFieldSchema;

export type SequenceFieldSchema = VisibleFieldSchema | HiddenFieldSchema;

export type SequenceSchema = {[key: string]: SequenceFieldSchema};

export type SchemaKeysRecord<S extends SequenceSchema> = Record<
	keyof S,
	unknown
>;

export const sequenceVisualStyleSchema = {
	'style.transformOrigin': {
		type: 'transform-origin',
		step: 1,
		default: '50% 50%',
		description: 'Transform origin',
	},
	'style.translate': {
		type: 'translate',
		step: 1,
		default: '0px 0px',
		description: 'Offset',
	},
	'style.scale': {
		type: 'scale',
		max: 100,
		step: 0.01,
		default: 1,
		description: 'Scale',
	},
	'style.rotate': {
		type: 'rotation-css',
		step: 1,
		default: '0deg',
		description: 'Rotation',
	},
	'style.opacity': {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Opacity',
		hiddenFromList: false,
	},
} as const satisfies SequenceSchema;

export const sequencePremountSchema = {
	premountFor: {
		type: 'number',
		default: 0,
		description: 'Premount For',
		min: 0,
		step: 1,
		hiddenFromList: false,
	},
	postmountFor: {
		type: 'number',
		default: 0,
		min: 0,
		step: 1,
		hiddenFromList: true,
	},
	styleWhilePremounted: {
		type: 'hidden',
	},
	styleWhilePostmounted: {
		type: 'hidden',
	},
} as const satisfies SequenceSchema;

export const sequenceStyleSchema = {
	...sequenceVisualStyleSchema,
	...sequencePremountSchema,
} as const satisfies SequenceSchema;

export const hiddenField: SequenceFieldSchema = {
	type: 'boolean',
	default: false,
	description: 'Hidden',
};

const showInTimelineField: SequenceFieldSchema = {
	type: 'hidden',
};

export const sequenceNameField: SequenceFieldSchema = {
	type: 'hidden',
};

export const extendSchemaWithSequenceName = <S extends SequenceSchema>(
	schema: S,
): S & {name: SequenceFieldSchema} => {
	return {
		name: sequenceNameField,
		...schema,
	};
};

export const durationInFramesField = {
	type: 'number',
	default: undefined,
	min: 1,
	step: 1,
	hiddenFromList: true,
} as const satisfies SequenceFieldSchema;

export const fromField = {
	type: 'number',
	default: 0,
	step: 1,
	hiddenFromList: true,
} as const satisfies SequenceFieldSchema;

export const sequenceSchema = extendSchemaWithSequenceName({
	hidden: hiddenField,
	showInTimeline: showInTimelineField,
	from: fromField,
	durationInFrames: durationInFramesField,
	layout: {
		type: 'enum',
		default: 'absolute-fill',
		description: 'Layout',
		variants: {
			'absolute-fill': sequenceStyleSchema,
			none: {},
		},
	},
} as const satisfies SequenceSchema);

export const sequenceSchemaWithoutFrom = extendSchemaWithSequenceName({
	hidden: hiddenField,
	showInTimeline: showInTimelineField,
	durationInFrames: durationInFramesField,
	layout: sequenceSchema.layout,
} as const satisfies SequenceSchema);

export const sequenceSchemaDefaultLayoutNone: SequenceSchema = {
	...sequenceSchema,
	layout: {
		...sequenceSchema.layout,
		default: 'none',
	},
};
