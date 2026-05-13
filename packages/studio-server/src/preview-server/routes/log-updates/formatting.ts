export const colorValue = (str: string) => {
	if (
		(str.startsWith("'") && str.endsWith("'")) ||
		(str.startsWith('"') && str.endsWith('"'))
	) {
		return stringValue(str);
	}

	if (/^-?\d+(\.\d+)?$/.test(str)) {
		return numberValue(str);
	}

	return punctuation(str);
};

// eslint-disable-next-line no-control-regex
const stripAnsi = (str: string) => str.replace(/\u001b\[[0-9;]*m/g, '');

// 24-bit ANSI helpers
export const fg = (r: number, g: number, b: number, str: string) =>
	`\u001b[38;2;${r};${g};${b}m${str}\u001b[39m`;
export const bg = (r: number, g: number, b: number, str: string) =>
	`\u001b[48;2;${r};${g};${b}m${str}\u001b[49m`;

// Monokai-inspired syntax colors
export const attrName = (str: string) => fg(166, 226, 46, str);
export const equals = (str: string) => fg(249, 38, 114, str);
export const punctuation = (str: string) => fg(248, 248, 242, str);
export const stringValue = (str: string) => fg(230, 219, 116, str);
export const numberValue = (str: string) => fg(174, 129, 255, str);
export const strikeThrough = (str: string) =>
	`\u001b[9m\u001b[38;2;255;85;85m${stripAnsi(str)}\u001b[39m\u001b[29m`;
