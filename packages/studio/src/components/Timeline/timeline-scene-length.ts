// Resolve the arithmetic used by timeline dimensions and trim hit areas. The
// parser deliberately accepts lengths and math functions, never JavaScript.
export const resolveTimelineSceneLength = (
	value: string,
	available: number,
	viewport: {width: number; height: number},
): number | null => {
	const tokens =
		value.match(
			/(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?(?:px|%|[sdl]?vw|[sdl]?vh|vmin|vmax)?|calc|min|max|clamp|[()+*/,-]/gi,
		) ?? [];
	if (tokens.join('') !== value.replace(/\s+/g, '')) return null;
	let index = 0;
	const primary = (): number => {
		const token = tokens[index++];
		if (token === '+' || token === '-')
			return primary() * (token === '-' ? -1 : 1);
		if (token === '(') {
			const result = sum();
			return tokens[index++] === ')' ? result : NaN;
		}

		if (/^(calc|min|max|clamp)$/i.test(token ?? '')) {
			if (tokens[index++] !== '(') return NaN;
			const values: number[] = [sum()];
			while (tokens[index] === ',') {
				index++;
				values.push(sum());
			}

			if (tokens[index++] !== ')') return NaN;
			if (token === 'calc') return values.length === 1 ? values[0] : NaN;
			if (token === 'min') return Math.min(...values);
			if (token === 'max') return Math.max(...values);
			return values.length === 3
				? Math.max(values[0], Math.min(values[1], values[2]))
				: NaN;
		}

		const number = /^((?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?)(.*)$/i.exec(
			token ?? '',
		);
		if (!number) return NaN;
		const amount = Number(number[1]);
		const unit = number[2].toLowerCase();
		if (unit === '%') return (amount * available) / 100;
		if (unit === 'vmin')
			return (amount * Math.min(viewport.width, viewport.height)) / 100;
		if (unit === 'vmax')
			return (amount * Math.max(viewport.width, viewport.height)) / 100;
		if (unit.endsWith('vw')) return (amount * viewport.width) / 100;
		if (unit.endsWith('vh')) return (amount * viewport.height) / 100;
		return amount;
	};

	const product = (): number => {
		let result = primary();
		while (tokens[index] === '*' || tokens[index] === '/') {
			const operator = tokens[index++];
			const next = primary();
			result = operator === '*' ? result * next : result / next;
		}

		return result;
	};

	const sum = (): number => {
		let result = product();
		while (tokens[index] === '+' || tokens[index] === '-') {
			const operator = tokens[index++];
			const next = product();
			result += operator === '+' ? next : -next;
		}

		return result;
	};

	const resolvedLength = sum();
	return index === tokens.length && Number.isFinite(resolvedLength)
		? resolvedLength
		: null;
};

// Whitespace within calc()/min() belongs to a single shorthand value.
export const splitTimelineSceneStyleValues = (value: string): string[] => {
	const values: string[] = [];
	let depth = 0;
	let start = 0;
	for (let index = 0; index <= value.length; index++) {
		const character = value[index];
		if (character === '(') depth++;
		if (character === ')') depth--;
		if (index === value.length || (/\s/.test(character) && depth === 0)) {
			const token = value.slice(start, index).trim();
			if (token) values.push(token);
			start = index + 1;
		}
	}

	return values;
};
