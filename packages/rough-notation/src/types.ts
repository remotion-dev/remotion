import {z} from 'zod';

export type Rect = {
	readonly x: number;
	readonly y: number;
	readonly w: number;
	readonly h: number;
};

const padding = z
	.object({
		left: z.number().default(0),
		right: z.number().default(0),
		top: z.number().default(0),
		bottom: z.number().default(0),
	})
	.optional()
	.default({
		bottom: 0,
		left: 0,
		right: 0,
		top: 0,
	});

const bracket = z.enum(['left', 'right', 'top', 'bottom']);
const brackets = z.array(bracket).optional().default(['right']);

const box = z.enum(['inside', 'around']);

export const annotationConfig = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('none'),
	}),
	z.object({
		type: z.literal('underline'),
		color: z.string().optional().default('currentColor'),
		strokeWidth: z.number().optional().default(20),
		padding,
		iterations: z.number().int().min(1).optional().default(2),
		rtl: z.boolean().optional().default(false),
	}),
	z.object({
		type: z.literal('strike-through'),
		color: z.string().optional().default('currentColor'),
		strokeWidth: z.number().optional().default(20),
		iterations: z.number().int().min(1).optional().default(1),
		rtl: z.boolean().optional().default(false),
	}),
	z.object({
		type: z.literal('box'),
		color: z.string().optional().default('currentColor'),
		iterations: z.number().int().min(1).optional().default(2),
		padding,
		strokeWidth: z.number().optional().default(7),
	}),
	z.object({
		type: z.literal('bracket'),
		color: z.string().optional().default('currentColor'),
		padding,
		brackets,
		strokeWidth: z.number().optional().default(20),
	}),
	z.object({
		type: z.literal('crossed-off'),
		color: z.string().optional().default('currentColor'),
		iterations: z.number().int().min(1).optional().default(1),
		rtl: z.boolean().optional().default(false),
		strokeWidth: z.number().optional().default(20),
	}),
	z.object({
		type: z.literal('circle'),
		color: z.string().optional().default('currentColor'),
		padding,
		strokeWidth: z.number().optional().default(20),
		iterations: z.number().int().min(1).optional().default(2),
		box,
	}),
	z.object({
		type: z.literal('highlight'),
		color: z.string().optional().default('currentColor'),
		padding,
		iterations: z.number().int().min(1).optional().default(2),
		rtl: z.boolean().optional().default(false),
	}),
]);

export type AnnotationConfig = z.infer<typeof annotationConfig>;
