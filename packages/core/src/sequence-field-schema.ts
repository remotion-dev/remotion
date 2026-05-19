export type HiddenFieldSchema = {
	type: 'hidden';
};

export type NumberFieldSchema = {
	type: 'number';
	min?: number;
	max?: number;
	step?: number;
	default: number | undefined;
	description?: string;
};

export type BooleanFieldSchema = {
	type: 'boolean';
	default: boolean;
	description?: string;
};

export type RotationFieldSchema = {
	type: 'rotation';
	step?: number;
	default: string | undefined;
	description?: string;
};

export type TranslateFieldSchema = {
	type: 'translate';
	step?: number;
	default: string | undefined;
	description?: string;
};

export type ColorFieldSchema = {
	type: 'color';
	default: string | undefined;
	description?: string;
};

export type EnumFieldSchema = {
	type: 'enum';
	default: string;
	description?: string;
	variants: Record<string, SequenceSchema>;
};

export type VisibleFieldSchema =
	| NumberFieldSchema
	| BooleanFieldSchema
	| RotationFieldSchema
	| TranslateFieldSchema
	| ColorFieldSchema
	| EnumFieldSchema;

export type SequenceFieldSchema = VisibleFieldSchema | HiddenFieldSchema;

export type SequenceSchema = {[key: string]: SequenceFieldSchema};

export type SchemaKeysRecord<S extends SequenceSchema> = Record<
	keyof S,
	unknown
>;

export const sequenceVisualStyleSchema = {
	'style.translate': {
		type: 'translate',
		step: 1,
		default: '0px 0px',
		description: 'Offset',
	},
	'style.scale': {
		type: 'number',
		min: 0.05,
		max: 100,
		step: 0.01,
		default: 1,
		description: 'Scale',
	},
	'style.rotate': {
		type: 'rotation',
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
	},
} as const satisfies SequenceSchema;

export const sequencePremountSchema = {
	premountFor: {
		type: 'number',
		default: 0,
		description: 'Premount For',
		min: 0,
		step: 1,
	},
	postmountFor: {
		type: 'hidden',
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

export const sequenceSchema = {
	hidden: hiddenField,
	layout: {
		type: 'enum',
		default: 'absolute-fill',
		description: 'Layout',
		variants: {
			'absolute-fill': sequenceStyleSchema,
			none: {},
		},
	},
} as const satisfies SequenceSchema;

export const sequenceSchemaDefaultLayoutNone: SequenceSchema = {
	...sequenceSchema,
	layout: {
		...sequenceSchema.layout,
		default: 'none',
	},
};
