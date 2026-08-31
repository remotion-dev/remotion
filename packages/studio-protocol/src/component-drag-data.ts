import * as z from 'zod/mini';

export type ComponentProp = {
	name: string;
	value: string | number | boolean;
};

export type ComponentDimensions = {
	height: number;
	width: number;
};

export type ComponentDragData = {
	type: 'remotion-component';
	version: 1;
	component: {
		componentName: string;
		dimensions?: ComponentDimensions;
		importName: string;
		importPath: string;
		props: ComponentProp[];
	};
};

const componentIdentifierSchema = z
	.string()
	.check(z.regex(/^[A-Z_$][A-Za-z0-9_$]*$/));
const componentImportPathSchema = z
	.string()
	.check(
		z.refine(
			(value) =>
				value.length > 0 &&
				value.length < 200 &&
				!value.includes('\\') &&
				!value.includes('\0') &&
				!value.startsWith('/') &&
				/^[A-Za-z0-9@._/-]+$/.test(value),
		),
	);
const componentPropNameSchema = z
	.string()
	.check(
		z.refine(
			(value) => value !== 'style' && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value),
		),
	);
const componentPropSchema = z.object({
	name: componentPropNameSchema,
	value: z.union([z.string(), z.number(), z.boolean()]),
});
const componentPropsSchema = z.array(componentPropSchema).check(
	z.refine((props) => {
		const names = props.map((prop) => prop.name);
		return new Set(names).size === names.length;
	}),
);
const componentDimensionsSchema = z.object({
	width: z.number().check(z.nonnegative()),
	height: z.number().check(z.nonnegative()),
});
const componentDragDataSchema = z.object({
	type: z.literal('remotion-component'),
	version: z.literal(1),
	component: z.object({
		componentName: componentIdentifierSchema,
		dimensions: z.optional(componentDimensionsSchema),
		importName: componentIdentifierSchema,
		importPath: componentImportPathSchema,
		props: componentPropsSchema,
	}),
});

export const isComponentIdentifier = (value: unknown): value is string =>
	z.safeParse(componentIdentifierSchema, value).success;

export const isComponentImportPath = (value: unknown): value is string =>
	z.safeParse(componentImportPathSchema, value).success;

export const isComponentPropName = (value: unknown): value is string =>
	z.safeParse(componentPropNameSchema, value).success;

export const isComponentProp = (value: unknown): value is ComponentProp =>
	z.safeParse(componentPropSchema, value).success;

export const areComponentProps = (value: unknown): value is ComponentProp[] =>
	z.safeParse(componentPropsSchema, value).success;

export const makeComponentDragData = ({
	componentName,
	dimensions,
	importName,
	importPath,
	props,
}: {
	componentName: string;
	dimensions?: ComponentDimensions | null;
	importName: string;
	importPath: string;
	props: ComponentProp[];
}): ComponentDragData => {
	return {
		type: 'remotion-component',
		version: 1,
		component: {
			componentName,
			...(dimensions ? {dimensions} : {}),
			importName,
			importPath,
			props,
		},
	};
};

export const parseComponentDragData = (
	value: string,
): ComponentDragData | null => {
	try {
		const parsed = z.safeParse(componentDragDataSchema, JSON.parse(value));
		if (!parsed.success) {
			return null;
		}

		return makeComponentDragData({
			componentName: parsed.data.component.componentName,
			dimensions: parsed.data.component.dimensions ?? null,
			importName: parsed.data.component.importName,
			importPath: parsed.data.component.importPath,
			props: parsed.data.component.props,
		});
	} catch {
		return null;
	}
};
