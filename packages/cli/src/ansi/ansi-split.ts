const ansiRegex = () => {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
	].join('|');

	return new RegExp(pattern, 'g');
};

export function splitAnsi(str: string): string[] {
	const parts = str.match(ansiRegex());
	if (!parts) return [str];

	const result = [];
	let offset = 0;
	let ptr = 0;

	for (let i = 0; i < parts.length; i++) {
		offset = str.indexOf(parts[i], offset);
		if (offset === -1) throw new Error('Could not split string');
		if (ptr !== offset) result.push(str.slice(ptr, offset));
		if (ptr === offset && result.length) {
			result[result.length - 1] += parts[i];
		} else {
			if (offset === 0) result.push('');
			result.push(parts[i]);
		}

		ptr = offset + parts[i].length;
	}

	result.push(str.slice(ptr));
	return result;
}

export const stripAnsi = (str: string) => {
	if (typeof str !== 'string') {
		throw new TypeError(`Expected a \`string\`, got \`${typeof str}\``);
	}

	return str.replace(ansiRegex(), '');
};
