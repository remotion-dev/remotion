import {NoReactInternals} from 'remotion/no-react';

export type EnumPath = (string | number)[];

function replacerWithPath(
	replacer: (
		this: Record<string, unknown>,
		field: string,
		value: unknown,
		path: (string | number)[],
	) => unknown,
) {
	const m = new Map();

	return function (
		this: Record<string, unknown>,
		field: string,
		value: unknown,
	) {
		const path = [m.get(this), field].flat(1);
		if (value === Object(value)) {
			m.set(value, path);
		}

		return replacer.call(
			this,
			field,
			value,
			path.filter((item) => typeof item !== 'undefined' && item !== ''),
		);
	};
}

const doesMatchPath = (path1: EnumPath, enumPaths: EnumPath[]) => {
	return enumPaths.some((p) =>
		path1.every((item, index) => {
			if (p[index] === '[]' && !Number.isNaN(Number(item))) {
				return true;
			}

			if (p[index] === '{}' && typeof item === 'string') {
				return true;
			}

			return item === p[index];
		}),
	);
};

export const stringifyDefaultProps = ({
	props,
	enumPaths,
}: {
	props: unknown;
	enumPaths: EnumPath[];
}) => {
	return JSON.stringify(
		props,
		replacerWithPath(function (key, value, path) {
			/* Don't replace with arrow function! This function uses `this` */
			const item = this[key];

			if (typeof item === 'string' && doesMatchPath(path, enumPaths)) {
				return `${item}__ADD_AS_CONST__`;
			}

			if (
				typeof item === 'string' &&
				item.startsWith(NoReactInternals.FILE_TOKEN)
			) {
				return `__REMOVEQUOTE____WRAP_IN_STATIC_FILE_START__${decodeURIComponent(
					item.replace(NoReactInternals.FILE_TOKEN, ''),
				)}__WRAP_IN_STATIC_FILE_END____REMOVEQUOTE__`;
			}

			if (
				typeof item === 'string' &&
				item.startsWith(NoReactInternals.DATE_TOKEN)
			) {
				return `__REMOVEQUOTE____WRAP_IN_DATE_START__${decodeURIComponent(
					item.replace(NoReactInternals.DATE_TOKEN, ''),
				)}__WRAP_IN_DATE_END____REMOVEQUOTE__`;
			}

			return value;
		}),
	)
		.replace(/"__REMOVEQUOTE__/g, '')
		.replace(/__REMOVEQUOTE__"/g, '')
		.replace(/__ADD_AS_CONST__"/g, '" as const')
		.replace(/__WRAP_IN_STATIC_FILE_START__/g, 'staticFile("')
		.replace(/__WRAP_IN_STATIC_FILE_END__/g, '")')
		.replace(/__WRAP_IN_DATE_START__/g, 'new Date("')
		.replace(/__WRAP_IN_DATE_END__/g, '")');
};
