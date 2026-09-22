export type CodemodValue =
	| string
	| number
	| boolean
	| null
	| CodemodValue[]
	| {[key: string]: CodemodValue};
