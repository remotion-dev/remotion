export type HiddenFieldSchema = {
	type: 'hidden';
	keyframable?: boolean;
};

export type NumberFieldSchema = {
	type: 'number';
	min?: number;
	max?: number;
	step?: number;
	default: number | null | undefined;
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
	visual?:
		| {
				readonly type: 'line';
				readonly to: string;
		  }
		| {
				readonly type: 'ellipse';
				readonly width: string;
				readonly height: string;
				readonly rotation?: string;
				readonly innerScale?: string;
		  };
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

export type TextContentFieldSchema = {
	type: 'text-content';
	default: string;
	description?: string;
	keyframable?: false;
};

export type EnumFieldSchema = {
	type: 'enum';
	default: string;
	description?: string;
	variants: Record<string, InteractivitySchema>;
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
	| TextContentFieldSchema
	| ArrayFieldSchema
	| EnumFieldSchema;

export type InteractivitySchemaField = VisibleFieldSchema | HiddenFieldSchema;

export type InteractivitySchema = {[key: string]: InteractivitySchemaField};

export type InteractivitySchemaKeysRecord<S extends InteractivitySchema> =
	Record<keyof S, unknown>;

export const transformSchema = {
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
} as const satisfies InteractivitySchema;

export const sequenceVisualStyleSchema = transformSchema;

export const textSchema = {
	'style.color': {
		type: 'color',
		default: undefined,
		description: 'Color',
	},
	'style.fontSize': {
		type: 'number',
		default: undefined,
		min: 0,
		step: 1,
		description: 'Font size',
		hiddenFromList: false,
	},
	'style.lineHeight': {
		type: 'number',
		default: undefined,
		min: 0,
		step: 0.05,
		description: 'Line height',
		hiddenFromList: false,
	},
	'style.fontWeight': {
		type: 'enum',
		default: '400',
		description: 'Font weight',
		variants: {
			'100': {},
			'200': {},
			'300': {},
			'400': {},
			'500': {},
			'600': {},
			'700': {},
			'800': {},
			'900': {},
			normal: {},
			bold: {},
		},
	},
	'style.fontStyle': {
		type: 'enum',
		default: 'normal',
		description: 'Font style',
		variants: {
			normal: {},
			italic: {},
			oblique: {},
		},
	},
	'style.textAlign': {
		type: 'enum',
		default: 'left',
		description: 'Text align',
		variants: {
			left: {},
			center: {},
			right: {},
			justify: {},
			start: {},
			end: {},
		},
	},
	'style.letterSpacing': {
		type: 'number',
		default: undefined,
		step: 0.1,
		description: 'Letter spacing',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

export const textContentSchema = {
	children: {
		type: 'text-content',
		default: '',
		description: 'Text',
		keyframable: false,
	},
} as const satisfies InteractivitySchema;

export const premountSchema = {
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
} as const satisfies InteractivitySchema;

export const sequencePremountSchema = premountSchema;

export const sequenceStyleSchema = {
	...transformSchema,
	...premountSchema,
} as const satisfies InteractivitySchema;

export const hiddenField: InteractivitySchemaField = {
	type: 'boolean',
	default: false,
	description: 'Hidden',
};

const showInTimelineField: InteractivitySchemaField = {
	type: 'hidden',
};

export const sequenceNameField: InteractivitySchemaField = {
	type: 'hidden',
};

export const extendSchemaWithSequenceName = <S extends InteractivitySchema>(
	schema: S,
): S & {name: InteractivitySchemaField} => {
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
} as const satisfies InteractivitySchemaField;

export const fromField = {
	type: 'number',
	default: 0,
	step: 1,
	hiddenFromList: true,
} as const satisfies InteractivitySchemaField;

export const trimBeforeField = {
	type: 'number',
	default: 0,
	min: 0,
	step: 1,
	hiddenFromList: true,
} as const satisfies InteractivitySchemaField;

export const freezeField = {
	type: 'number',
	default: null,
	step: 1,
	hiddenFromList: true,
} as const satisfies InteractivitySchemaField;

export const baseSchema = {
	durationInFrames: durationInFramesField,
	from: fromField,
	trimBefore: trimBeforeField,
	freeze: freezeField,
	hidden: hiddenField,
	name: sequenceNameField,
	showInTimeline: showInTimelineField,
} as const satisfies InteractivitySchema;

export const sequenceSchema = {
	...baseSchema,
	layout: {
		type: 'enum',
		default: 'absolute-fill',
		description: 'Layout',
		variants: {
			'absolute-fill': sequenceStyleSchema,
			none: {},
		},
	},
} as const satisfies InteractivitySchema;

export const baseSchemaWithoutFrom = {
	durationInFrames: durationInFramesField,
	trimBefore: trimBeforeField,
	freeze: freezeField,
	hidden: hiddenField,
	name: sequenceNameField,
	showInTimeline: showInTimelineField,
} as const satisfies InteractivitySchema;

export const sequenceSchemaWithoutFrom = {
	...baseSchemaWithoutFrom,
	layout: sequenceSchema.layout,
} as const satisfies InteractivitySchema;

export const sequenceSchemaDefaultLayoutNone: InteractivitySchema = {
	...sequenceSchema,
	layout: {
		...sequenceSchema.layout,
		default: 'none',
	},
};
