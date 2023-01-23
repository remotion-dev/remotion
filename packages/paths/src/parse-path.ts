// Copied partially from https://github.com/jkroso/parse-svg-path/blob/master/index.js
const length = {
	a: 7,
	c: 6,
	h: 1,
	l: 2,
	m: 2,
	q: 4,
	s: 4,
	t: 2,
	v: 1,
	z: 0,
} as const;
const segment = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
const number = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;

export const parsePath = (path: string) => {
	const data: number[][] = [];
	path.replace(segment, (_, command, argnts) => {
		let type = command.toLowerCase();
		const dataArgs = parseValues(argnts);

		// overloaded moveTo
		if (type === 'm' && dataArgs.length > 2) {
			data.push([command].concat(dataArgs.splice(0, 2)));
			type = 'l';
			command = command === 'm' ? 'l' : 'L';
		}

		let i = 0;
		while (i < dataArgs.length) {
			const key = type as keyof typeof length;
			if (dataArgs.length === length[key]) {
				dataArgs.unshift(command);
				data.push(dataArgs);
				break;
			}

			if (dataArgs.length < length[key]) throw new Error('malformed path data');
			data.push([command].concat(dataArgs.splice(0, length[key])));
			i++;
		}

		return '';
	});
	return data;
};

const parseValues = (args: string) => {
	const numbers = args.match(number);
	return numbers ? numbers.map(Number) : [];
};
