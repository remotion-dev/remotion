export function expandElementSourceReferences(input: {
	raw: string;
	sourceFilePath: string;
}): string;

export function getElementSourceCodeBlock(input: {
	file: string;
	sourceFilePath: string;
}): string;

export function getRemotionElementSource(input: {
	file: string;
	sourceFilePath: string;
}): string;
