import {highlight} from 'codehike/code';

export type DarkPlusToken = {startIndex: number; scopes: string};

export const highlightCode = async (
	code: string,
): Promise<DarkPlusToken[][]> => {
	const highlighted = await highlight(
		{value: code, lang: 'tsx', meta: ''},
		'dark-plus',
	);
	const lines: DarkPlusToken[][] = [[]];
	let column = 0;
	for (const token of highlighted.tokens) {
		const content = typeof token === 'string' ? token : token[0];
		const color =
			typeof token === 'string' ? '#D4D4D4' : (token[1] ?? '#D4D4D4');
		const parts = content.split('\n');
		for (let index = 0; index < parts.length; index++) {
			if (index > 0) {
				lines.push([]);
				column = 0;
			}
			if (parts[index].length > 0) {
				lines.at(-1)!.push({
					startIndex: column,
					scopes: `color${color.slice(1).toLowerCase()}`,
				});
				column += parts[index].length;
			}
		}
	}
	return lines;
};
