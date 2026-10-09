export type CodemodValue =
	| string
	| number
	| boolean
	| null
	| readonly CodemodValue[]
	| {[key: string]: CodemodValue};
