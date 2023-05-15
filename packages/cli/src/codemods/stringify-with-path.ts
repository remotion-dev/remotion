type Path = (string | number)[];

const doesMatchPath = (path1: Path, enumPaths: Path[]) => {
	return enumPaths.some((p) =>
		path1.every((item, index) => {
			if (p[index] === '[]' && !Number.isNaN(Number(item))) {
				return true;
			}

			if (p[index] === '{}' && typeof item === 'string') {
				return true;
			}

			return item === p[index];
		})
	);
};

export const stringifyDefaultProps = ({
	props,
	enumPath,
}: {
	props: unknown;
	enumPath: Path[];
}) =>
	JSON.stringify(
		props,
		replacerWithPath(function (key, value, path) {
			/* Don't replace with arrow function */ const item = this[key];
			if (item instanceof Date) {
				return `__REMOVEQUOTE__new Date('${item.toISOString()}')__REMOVEQUOTE__`;
			}

			if (typeof this[key] === 'string' && doesMatchPath(path, enumPath)) {
				return `${this[key]}__ADD_AS_CONST__`;
			}

			return value;
		})
	)
		.replace(/"__REMOVEQUOTE__/g, '')
		.replace(/__REMOVEQUOTE__"/g, '')
		.replace(/__ADD_AS_CONST__"/g, '" as const');

function replacerWithPath(
	replacer: (
		this: Record<string, unknown>,
		field: string,
		value: unknown,
		path: (string | number)[]
	) => unknown
) {
	const m = new Map();

	return function (
		this: Record<string, unknown>,
		field: string,
		value: unknown
	) {
		const path = [m.get(this), field].flat(1);
		if (value === Object(value)) {
			m.set(value, path);
		}

		return replacer.call(
			this,
			field,
			value,
			path.filter((item) => typeof item !== 'undefined' && item !== '')
		);
	};
}
