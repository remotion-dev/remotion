import type {transform, TransformOptions} from 'esbuild';

type Implementation = {
	transform: typeof transform;
};

type Except<ObjectType, Properties> = {
	[Key in keyof ObjectType as Key extends Properties
		? never
		: Key]: ObjectType[Key];
};

export type LoaderOptions = Except<
	TransformOptions,
	'sourcemap' | 'sourcefile'
> & {
	implementation: Implementation;
	remotionRoot: string;
};
