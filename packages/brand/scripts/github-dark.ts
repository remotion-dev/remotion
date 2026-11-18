import {highlight} from 'codehike/code';
import {brandCodeTheme} from '../src/code-theme';

type MonacoCodeToken = {startIndex: number; scopes: string};

export const highlightCode = async (
	code: string,
): Promise<MonacoCodeToken[][]> => {
	const highlighted = await highlight(
		{value: code, lang: 'tsx', meta: ''},
		brandCodeTheme,
	);
	const lines: MonacoCodeToken[][] = [[]];
	let column = 0;
	for (const token of highlighted.tokens) {
		const content = typeof token === 'string' ? token : token[0];
		const color =
			typeof token === 'string' ? '#E1E4E8' : (token[1] ?? '#E1E4E8');
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
