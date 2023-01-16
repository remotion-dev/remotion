export type ShapeInfo = {
	path: string;
	width: number;
	height: number;
};

export type ShapeOption<Name, Type> = {
	name: Name;
	description: string;
	exampleValue: Type;
};
