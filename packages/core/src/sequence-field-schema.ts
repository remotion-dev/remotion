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

export type SequenceFieldSchema = NumberFieldSchema | BooleanFieldSchema;

export type SequenceSchema = Record<string, SequenceFieldSchema>;

export type SchemaKeysRecord<S extends SequenceSchema> = Record<
	keyof S,
	unknown
>;
