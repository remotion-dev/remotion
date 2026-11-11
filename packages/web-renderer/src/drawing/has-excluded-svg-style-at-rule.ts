const whitespace = /[\t\n\f\r ]/;

const commentEnd = (text: string, index: number) => {
	const end = text.indexOf('*/', index + 2);
	return end === -1 ? text.length : end + 2;
};

const stringEnd = (text: string, index: number) => {
	const quote = text[index++];
	while (index < text.length) {
		if (text[index] === '\\') {
			index += text[index + 1] === '\r' && text[index + 2] === '\n' ? 3 : 2;
		} else if (text[index] === quote) return index + 1;
		else if (/[\n\r\f]/.test(text[index])) return index;
		else index++;
	}

	return index;
};

const escapeAt = (
	text: string,
	index: number,
): {value: string | null; end: number} => {
	const hex = /^[0-9a-f]{1,6}/i.exec(text.slice(index + 1));
	if (hex) {
		let end = index + 1 + hex[0].length;
		if (whitespace.test(text[end] ?? ''))
			end += text[end] === '\r' && text[end + 1] === '\n' ? 2 : 1;
		const code = Number.parseInt(hex[0], 16);
		return {
			value: String.fromCodePoint(
				code === 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)
					? 0xfffd
					: code,
			),
			end,
		};
	}

	const next = text[index + 1];
	return {
		value: next === undefined ? '\ufffd' : /[\n\r\f]/.test(next) ? null : next,
		end: index + 2,
	};
};

const nameAt = (text: string, index: number) => {
	let value = '';
	while (index < text.length) {
		const char = text[index];
		if (char === '\\') {
			const escaped = escapeAt(text, index);
			if (escaped.value === null) break;
			value += escaped.value;
			index = escaped.end;
		} else if (/[a-z0-9_-]/i.test(char) || char.charCodeAt(0) >= 0x80) {
			value += char;
			index++;
		} else break;
	}

	return {value, end: index};
};

const triviaEnd = (text: string, index: number) => {
	while (index < text.length) {
		if (whitespace.test(text[index])) index++;
		else if (text.startsWith('/*', index)) index = commentEnd(text, index);
		else break;
	}

	return index;
};

// Custom properties contain arbitrary component values, including brace blocks.
// Their at-keywords are values, not stylesheet or nested-rule statements.
const valueEnd = (text: string, index: number) => {
	let depth = 0;
	while (index < text.length) {
		const char = text[index];
		if (text.startsWith('/*', index)) index = commentEnd(text, index);
		else if (char === '"' || char === "'") index = stringEnd(text, index);
		else if (char === '\\') index = escapeAt(text, index).end;
		else if (char === ';' && depth === 0) return index;
		else if (char === '}' && depth === 0) return index;
		else {
			if ('([{'.includes(char)) depth++;
			else if (')]}'.includes(char)) depth--;
			index++;
		}
	}

	return index;
};

// Constructed-sheet parsing drops imports, and the selector walker cannot yet
// preserve scope roots. Only actual at-rule statements require that exclusion.
export const hasExcludedSvgStyleAtRule = (text: string) => {
	let start = true;
	let depth = 0;
	let index = text.charCodeAt(0) === 0xfeff ? 1 : 0;
	while (index < text.length) {
		const char = text[index];
		if (whitespace.test(char)) {
			index++;
			continue;
		}

		if (text.startsWith('/*', index)) {
			index = commentEnd(text, index);
			continue;
		}

		if (char === '"' || char === "'") {
			index = stringEnd(text, index);
			start = false;
			continue;
		}

		if (char === '(' || char === '[') {
			depth++;
			start = false;
			index++;
			continue;
		}

		if (char === ')' || char === ']') {
			depth = Math.max(0, depth - 1);
			index++;
			continue;
		}

		if (depth > 0) {
			index = char === '\\' ? escapeAt(text, index).end : index + 1;
			continue;
		}

		if ('{};'.includes(char)) {
			start = true;
			index++;
			continue;
		}

		if (start && char === '@') {
			const name = nameAt(text, index + 1);
			if (['import', 'scope'].includes(name.value.toLowerCase())) return true;
			index = Math.max(index + 1, name.end);
			start = false;
			continue;
		}

		if (start) {
			const name = nameAt(text, index);
			if (name.value.startsWith('--')) {
				const colon = triviaEnd(text, name.end);
				if (text[colon] === ':') {
					index = valueEnd(text, colon + 1);
					start = false;
					continue;
				}
			}
		}

		if (char === '\\') index = escapeAt(text, index).end;
		else index++;
		start = false;
	}

	return false;
};
