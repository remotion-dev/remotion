import {
	Internals,
	Interactive,
	type InteractivitySchemaField,
	type InteractivitySchema,
} from 'remotion';

export const numberField = ({
	defaultValue,
	description,
	hiddenFromList = false,
	max,
	min,
	step = 1,
}: {
	readonly defaultValue: number | undefined;
	readonly description: string;
	readonly hiddenFromList?: boolean;
	readonly max?: number;
	readonly min?: number;
	readonly step?: number;
}): InteractivitySchemaField => {
	return {
		type: 'number',
		default: defaultValue,
		description,
		hiddenFromList,
		max,
		min,
		step,
	};
};

export const booleanField = ({
	defaultValue,
	description,
}: {
	readonly defaultValue: boolean;
	readonly description: string;
}): InteractivitySchemaField => {
	return {
		type: 'boolean',
		default: defaultValue,
		description,
	};
};

export const colorField = ({
	defaultValue,
	description,
}: {
	readonly defaultValue: string | undefined;
	readonly description: string;
}): InteractivitySchemaField => {
	return {
		type: 'color',
		default: defaultValue,
		description,
	};
};

export const enumField = <T extends string>({
	defaultValue,
	description,
	variants,
}: {
	readonly defaultValue: T;
	readonly description: string;
	readonly variants: readonly T[];
}): InteractivitySchemaField => {
	return {
		type: 'enum',
		default: defaultValue,
		description,
		variants: Object.fromEntries(
			variants.map((variant) => [variant, {}]),
		) as Record<T, InteractivitySchema>,
	};
};

export const makeShapeSchema = (
	shapeFields: InteractivitySchema,
): InteractivitySchema => {
	return {
		...Internals.baseSchema,
		...shapeFields,
		fill: colorField({
			defaultValue: '#0b84ff',
			description: 'Fill',
		}),
		...Internals.transformSchema,
		...Interactive.backgroundSchema,
		...Interactive.borderSchema,
	};
};
